pipeline {
    agent any

    environment {
        BACKEND_DIR = "Backend"
        FRONTEND_DIR = "frontend"
        BACKEND_ENTRY = "server.js"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/NizarI20/ServiceHub.git'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Install & Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Run Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                    if lsof -i:3000 -t >/dev/null; then
                      kill -9 $(lsof -i:3000 -t)
                    fi
                    nohup node server.js > output.log 2>&1 &
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '🚀 CI/CD Pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed.'
        }
    }
}
