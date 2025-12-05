pipeline {
    // 設置 Agent，通常在 Docker 主機上執行或使用 Docker-in-Docker
    agent any

    // 定義全局變數
    environment {
        // Docker Hub 帳號名稱
        DOCKER_HUB_USER = 'justin220'
        // Docker 映像檔名稱
        IMAGE_NAME = 'devops-app'
        // Staging 環境的容器名稱
        CONTAINER_NAME = 'dev-app'
        // Staging 環境的埠號
        STAGING_PORT = 8081
        // Docker Hub 認證 ID 
        DOCKER_CREDENTIAL_ID = 'docker-hub-credentials'
        DISCORD_WEBHOOK      = credentials('discord-webhook-url')     
        STUDENT_NAME         = '黃雋亞'
        STUDENT_ID           = 'B11705056'
    }

    // 當推送到 'dev' 分支時才執行此流水線
    options {
        skipDefaultCheckout true // 避免使用預設 checkout，我們會在 Stage 內處理
    }

    stages {
        stage('Static Analysis') {
            steps {
                sh 'npm install'           // 安裝 eslint
                sh 'npm run lint'          // 執行 lint，失敗會直接中斷 pipeline
            }
        }

        stage('Checkout Source Code') {
            steps {
                echo "Checking out Git branch: ${env.BRANCH_NAME}"
                // 執行程式碼檢查
                checkout scm
            }
        }

        stage('Build & Push Docker Image (Staging)') {
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
            steps {
                script {
                    def imageTag = "dev-${env.BUILD_NUMBER}"
                    def fullImageName = "${env.DOCKER_HUB_USER}/${env.IMAGE_NAME}:${imageTag}"
                    
                    echo "Deploying Staging environment..."
                    
                    // 3. 清理：強制移除現有的 dev-app 容器
                    // 使用 || true 以防容器不存在時腳本失敗
                    echo "Cleaning up existing container: ${env.CONTAINER_NAME}"
                    sh "docker rm -f ${env.CONTAINER_NAME} || true"

                    // 4. 部署：運行新的容器到 Port 8081
                    echo "Running new container: ${env.CONTAINER_NAME} on port ${env.STAGING_PORT}"
                    sh "docker run -d --name ${env.CONTAINER_NAME} -p ${env.STAGING_PORT}:8080 ${fullImageName}"
                    
                    // 等待容器啟動 (視應用程式啟動速度調整等待時間)
                    sh "sleep 5"
                }
            }
        }
        
        stage('Verify Health Check') {
            steps {
                script {
                    echo "Verifying deployment using health check..."
                    def healthCheckUrl = "http://localhost:${env.STAGING_PORT}/health"
                    
                    // 5. 驗證：對 /health 端點運行 curl
                    // -f: 失敗時不輸出 HTML，-s: 靜默模式
                    // --retry 和 --retry-delay 增加穩定性，防止瞬時故障
                    sh "curl --retry 5 --retry-delay 5 -f -s ${healthCheckUrl}"
                    
                    echo "Staging deployment verified successfully. Application is healthy."
                }
            }
        }
        
        stage('Next Step: Manual Promotion to Prod') {
            steps {
                // 提示開發者或 QA 團隊 Staging 環境已就緒
                echo "Staging environment (dev-${env.BUILD_NUMBER}) is ready on port ${env.STAGING_PORT}."
                echo "After verification, manually trigger the 'Promote to Prod' job."
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
