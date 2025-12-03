pipeline {
    agent any

    environment {
        // 請改成你自己的
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')  // Jenkins 裡要先加這個 credential
        IMAGE_NAME           = 'justin220/lsap-hw6'              // 例如：john2025/nodejs-app
        DISCORD_WEBHOOK      = credentials('discord-webhook-url')     // Jenkins 裡也要先加這個 secret text
        STUDENT_NAME         = '黃雋亞'
        STUDENT_ID           = 'B11705056'
    }

    stages {
        stage('Static Analysis') {
            steps {
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
