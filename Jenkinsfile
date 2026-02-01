pipeline {
    agent any
    environment {
        DOCKER_CRED_ID = "docker-hub-cred"
    }

    stages {
        stage('Test Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}",
                                                  usernameVariable: 'DOCKER_USER',
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                    sh 'docker info' // optional: verify login info
                }
            }
        }
    }

    post {
        always {
            echo "✅ Docker Hub login test finished."
        }
        failure {
            echo "❌ Docker Hub login test failed."
        }
    }
}
