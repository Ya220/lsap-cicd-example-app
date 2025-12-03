pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')  
        IMAGE_NAME           = 'justin220/lsap-hw6'              
        DISCORD_WEBHOOK      = credentials('discord-webhook-url')    
        STUDENT_NAME         = '黃雋亞'
        STUDENT_ID           = 'B11705056'
    }

    stages {
        stage('Static Analysis') {
            steps {
                def actualBranchName = sh(
                    script: 'git rev-parse --abbrev-ref HEAD', // 取得當前 HEAD 的分支名稱
                    returnStdout: true // 將命令的輸出作為回傳值
                ).trim()

                echo "Actual Git Branch Name: ${actualBranchName}"

                sh 'npm install'           // 安裝 eslint
                sh 'npm run lint'          // 執行 lint，失敗會直接中斷 pipeline
            }
        }

        // 只有 dev 和 main 才需要後面的步驟，這裡先寫死所有 branch 都會跑 lint
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
}pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')  
        IMAGE_NAME           = 'justin220/lsap-hw6'              
        DISCORD_WEBHOOK      = credentials('discord-webhook-url')    
        STUDENT_NAME         = '黃雋亞'
        STUDENT_ID           = 'B11705056'
    }

    stages {
        stage('Static Analysis') {
            steps {
                def actualBranchName = sh(
                    script: 'git rev-parse --abbrev-ref HEAD', // 取得當前 HEAD 的分支名稱
                    returnStdout: true // 將命令的輸出作為回傳值
                ).trim()

                echo "Actual Git Branch Name: ${actualBranchName}"

                sh 'npm install'           // 安裝 eslint
                sh 'npm run lint'          // 執行 lint，失敗會直接中斷 pipeline
            }
        }

        // 只有 dev 和 main 才需要後面的步驟，這裡先寫死所有 branch 都會跑 lint
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
