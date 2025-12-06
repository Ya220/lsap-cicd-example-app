pipeline {
    // 設置 Agent，通常在 Docker 主機上執行或使用 Docker-in-Docker
    agent any

    // 定義全局變數
    environment {
        // Docker Hub 帳號名稱
        DOCKER_HUB_USER = 'justin220'
        // Docker 映像檔名稱
        IMAGE_NAME = 'devops-app'
        // Docker Hub 認證 ID 
        DOCKER_CREDENTIAL_ID = 'docker-hub-credentials'
        // Staging 環境配置
        STAGING_CONTAINER = 'dev-app'
        STAGING_PORT = 8081
        // Production 環境配置
        PROD_CONTAINER = 'prod-app'
        PROD_PORT = 8082
        // 用於 Promotion 的目標標籤，預設為空
        TARGET_TAG = '' 
        DISCORD_WEBHOOK      = credentials('discord-webhook-url')     
        STUDENT_NAME         = '黃雋亞'
        STUDENT_ID           = 'B11705056'
    }

    options {
        skipDefaultCheckout true // 避免使用預設 checkout，我們會在 Stage 內處理
    }

    stages {
        stage('Checkout Source Code') {
            steps {
                echo "Checking out Git branch: ${env.BRANCH_NAME}"
                // 執行程式碼檢查
                checkout scm
            }
        }

        stage('Static Analysis') {
            steps {
                sh 'npm install'           // 安裝 eslint
                sh 'npm run lint'          // 執行 lint，失敗會直接中斷 pipeline
            }
        }

        stage('Build & Push Docker Image (Staging)') {
            when { 
                branch 'dev' 
            }
            steps {
                script {
                    // 使用 Jenkins 內建的 BUILD_NUMBER 變數來標記映像檔
                    def imageTag = "dev-${env.BUILD_NUMBER}"
                    def fullImageName = "${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${imageTag}"

                    echo "Building Docker image: ${fullImageName}"
                    
                    // 1. 建構 Docker 映像檔
                    // 假設您的 Dockerfile 在工作區根目錄
                    sh "docker build -t ${fullImageName} ."
                    
                    // 2. 登入 Docker Hub 並推送到 Docker Hub
                    // withCredentials 語法用於安全地使用 Jenkins Credentials
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIAL_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        echo "Pushing Docker image to Docker Hub..."
                        sh "docker push ${fullImageName}"
                        echo "Image pushed successfully with tag: ${imageTag}"
                    }
                }
            }
        }

        stage('Deploy Staging Environment') {
            when { 
                branch 'dev' 
            }
            steps {
                script {
                    def imageTag = "dev-${env.BUILD_NUMBER}"
                    def fullImageName = "${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${imageTag}"
                    
                    echo "Deploying Staging environment..."
                    
                    // 3. 清理：強制移除現有的 dev-app 容器
                    // 使用 || true 以防容器不存在時腳本失敗
                    echo "Cleaning up existing container: ${env.STAGING_CONTAINER}"
                    sh "docker rm -f ${env.STAGING_CONTAINER} || true"

                    // 4. 部署：運行新的容器到 Port 8081
                    echo "Running new container: ${env.STAGING_CONTAINER} on port ${env.STAGING_PORT}"
                    sh "docker run -d --name ${env.STAGING_CONTAINER} -p ${env.STAGING_PORT}:3000 ${fullImageName}"
                    
                    // 等待容器啟動 (視應用程式啟動速度調整等待時間)
                    sh "sleep 5"

                    // === 增加的調試步驟 A：檢查容器狀態 ===
                    echo "Checking container status..."
                    sh "docker ps -a --filter name=${env.STAGING_CONTAINER}"
                    
                    // === 增加的調試步驟 B：查看容器日誌 ===
                    echo "Checking container logs for startup errors..."
                    sh "docker logs ${env.STAGING_CONTAINER}"
                }
            }
        }
        
        stage('Verify Health Check') {
            when { 
                branch 'dev' 
            }
            steps {
                script {
                    echo "Verifying deployment using health check..."
                    def healthCheckUrl = "http://localhost:${env.STAGING_PORT}/health"
                    
                    // 5. 驗證：對 /health 端點運行 curl
                    // -f: 失敗時不輸出 HTML
                    // --retry 和 --retry-delay 增加穩定性，防止瞬時故障
                    sh "curl --retry 5 --retry-delay 5 -f ${healthCheckUrl}"
                    
                    echo "Staging deployment verified successfully. Application is healthy."
                }
            }
        }
        
        stage('Read Deployment Configuration') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // 1. 讀取 Configuration (假設檔案名為 deploy.config)
                    // 檔案內容應僅包含目標標籤，例如：dev-15
                    sh "pwd && ls -la deploy.config && cat deploy.config | od -c"
                    
                    // 使用 readFile 而不是 sh 命令來讀取文件
                    String tagContent = readFile(file: 'deploy.config').replaceAll(/\s+$/, '')
                    env.TARGET_TAG = tagContent
                    
                    echo "Read target deployment tag from deploy.config:"
                    echo tagContent
                    println("Tag content: " + tagContent)
                    println("Tag length: " + tagContent.length())
                    
                    if (tagContent == null || tagContent.isEmpty()) {
                        error('deploy.config is empty or missing content.')
                    }
                    if (!tagContent.startsWith('dev-')) {
                        echo "WARNING: Target tag does not look like a verified staging tag (missing 'dev-'). Proceeding anyway."
                    }
                }
            }
        }
        
        stage('Artifact Promotion & Retag') {
            when { 
                branch 'main' 
            }
            steps {
                script {
                    def sourceImage = "${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${env.TARGET_TAG}"
                    def prodTag = "prod-${env.BUILD_NUMBER}"
                    def targetImage = "${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${prodTag}"
                    
                    echo "Promoting image ${sourceImage} to ${targetImage}"

                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIAL_ID, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        
                        // 2. Artifact Promotion: Pull, Retag, and Push
                        echo "Pulling source image..."
                        sh "docker pull ${sourceImage}"
                        
                        echo "Retagging image..."
                        sh "docker tag ${sourceImage} ${targetImage}"
                        
                        echo "Pushing Production tag ${prodTag} to Docker Hub..."
                        sh "docker push ${targetImage}"
                        
                        echo "Image successfully promoted and pushed with tag: ${prodTag}"
                    }
                }
            }
        }
        
        stage('Deploy Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def prodTag = "prod-${env.BUILD_NUMBER}"
                    def targetImage = "${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${prodTag}"
                    
                    echo "Starting Production Deployment (GitOps Style)..."

                    // 1. 清理：強制移除現有的 prod-app 容器
                    echo "Cleaning up existing container: ${env.PROD_CONTAINER}"
                    sh "docker rm -f ${env.PROD_CONTAINER} || true"

                    // 2. 運行新的容器到 Port 8082
                    echo "Running new container: ${env.PROD_CONTAINER} on port ${env.PROD_PORT}"
                    sh "docker run -d --name ${env.PROD_CONTAINER} -p ${env.PROD_PORT}:8080 ${targetImage}"
                    
                    echo "Deployment complete. Production is running the promoted tag ${prodTag} on port ${env.PROD_PORT}"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            script {
                def embed = """
                {
                  "username": "Jenkins CI",
                  "avatar_url": "https://jenkins.io/images/logos/jenkins/jenkins.png",
                  "embeds": [
                    {
                      "title": "Build Failed",
                      "color": 15158332,
                      "fields": [
                        { "name": "Student",   "value": "${env.STUDENT_NAME} (${env.STUDENT_ID})", "inline": false },
                        { "name": "Job",       "value": "${env.JOB_NAME}",                     "inline": true },
                        { "name": "Build #",   "value": "${env.BUILD_NUMBER}",                 "inline": true },
                        { "name": "Branch",    "value": "${env.BRANCH_NAME}",                 "inline": true },
                        { "name": "Status",    "value": "${currentBuild.currentResult}",      "inline": true },
                        { "name": "Repository", "value": "${env.GIT_URL}",                     "inline": false }
                      ],
                      "timestamp": "${new Date(currentBuild.startTimeInMillis).format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))}"
                    }
                  ]
                }
                """.stripMargin()

                sh """
                    curl -H "Content-Type: application/json" \
                         -X POST \
                         -d '${embed}' \
                         ${env.DISCORD_WEBHOOK}
                """
            }
        }
        success {
            echo "Build succeeded! No notification sent (only on failure)."
        }
    }
}
