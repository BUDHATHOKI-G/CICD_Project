pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "ganeshbudhathoki/backend-app"
        FRONTEND_IMAGE = "ganeshbudhathoki/frontend-app"
        DOCKER_CRED_ID = "docker-hub-cred"
        K8S_NAMESPACE = "default"
    }

    triggers {
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
                    echo "🔖 Image Version: ${VERSION}"
                }
            }
        }

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKER_CRED_ID,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build & Push Images') {
            parallel {

                stage('Backend Image') {
                    steps {
                        sh '''
                            docker build -t ${BACKEND_IMAGE}:${VERSION} -t ${BACKEND_IMAGE}:latest backend
                            docker push ${BACKEND_IMAGE}:${VERSION}
                            docker push ${BACKEND_IMAGE}:latest
                        '''
                    }
                }

                stage('Frontend Image') {
                    steps {
                        sh '''
                            docker build -t ${FRONTEND_IMAGE}:${VERSION} -t ${FRONTEND_IMAGE}:latest frontend
                            docker push ${FRONTEND_IMAGE}:${VERSION}
                            docker push ${FRONTEND_IMAGE}:latest
                        '''
                    }
                }
            }
        }

        stage('Test Kubernetes Access') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        echo "🔐 Using kubeconfig at: $KUBECONFIG"
                        kubectl version --client
                        kubectl get pods -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }

        stage('Update Kubernetes Manifests') {
            steps {
                sh '''
                    sed -i 's|image: .*backend-app:.*|image: ${BACKEND_IMAGE}:${VERSION}|' k8s/backend-deployment.yaml
                    sed -i 's|image: .*frontend-app:.*|image: ${FRONTEND_IMAGE}:${VERSION}|' k8s/frontend-deployment.yaml
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        kubectl apply -f k8s/backend-deployment.yaml -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s/frontend-deployment.yaml -n ${K8S_NAMESPACE}

                        kubectl rollout restart deployment backend -n ${K8S_NAMESPACE}
                        kubectl rollout restart deployment frontend -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        kubectl rollout status deployment backend -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment frontend -n ${K8S_NAMESPACE}
                        kubectl get pods -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🚀 Deployment successful. Application is LIVE on Kubernetes."
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs."
        }
        always {
            sh 'docker logout || true'
        }
    }
}
