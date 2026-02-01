pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "ganeshbudhathoki/backend-app"
        FRONTEND_IMAGE = "ganeshbudhathoki/frontend-app"
        DOCKER_CRED_ID = "docker-hub-cred"
        K8S_NAMESPACE = "default"
    }

    triggers {
        // Replace with GitHub webhook later (recommended)
        pollSCM('* * * * *')
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Set Version') {
            steps {
                script {
                    env.VERSION = new Date().format("yyyyMMdd.HHmmss")
                    echo "🚀 Build version: ${env.VERSION}"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: DOCKER_CRED_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                      echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build & Push Docker Images') {
            parallel {

                stage('Backend') {
                    steps {
                        sh """
                        docker build \
                          -t ${BACKEND_IMAGE}:${VERSION} \
                          -t ${BACKEND_IMAGE}:latest \
                          backend

                        docker push ${BACKEND_IMAGE}:${VERSION}
                        docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }

                stage('Frontend') {
                    steps {
                        sh """
                        docker build \
                          -t ${FRONTEND_IMAGE}:${VERSION} \
                          -t ${FRONTEND_IMAGE}:latest \
                          frontend

                        docker push ${FRONTEND_IMAGE}:${VERSION}
                        docker push ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl apply -f k8s/backend-deployment.yaml -n ${K8S_NAMESPACE}
                kubectl apply -f k8s/frontend-deployment.yaml -n ${K8S_NAMESPACE}
                """
            }
        }

        stage('Force Rollout Restart') {
            steps {
                sh """
                kubectl rollout restart deployment/backend-deployment -n ${K8S_NAMESPACE}
                kubectl rollout restart deployment/frontend-deployment -n ${K8S_NAMESPACE}
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                sh """
                kubectl rollout status deployment/backend-deployment -n ${K8S_NAMESPACE}
                kubectl rollout status deployment/frontend-deployment -n ${K8S_NAMESPACE}
                kubectl get pods -n ${K8S_NAMESPACE}
                """
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD completed successfully. Production is LIVE."
        }
        failure {
            echo "❌ Pipeline failed. Production NOT updated."
        }
    }
}
