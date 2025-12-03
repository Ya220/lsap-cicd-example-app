pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                // Ensure the correct code is checked out
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install' 
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                // Use your project's test command (e.g., 'npm test', 'npm run test:ci')
                sh 'npm test -- --detectOpenHandles'
            }
        }
        
        stage('Cleanup') {
            steps {
                // Optional: clean up node_modules or other build artifacts
                sh 'rm -rf node_modules'
            }
        }
    }
}
