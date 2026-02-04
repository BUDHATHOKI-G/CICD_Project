
// pipeline {
//     agent any

//     environment {
//         BACKEND_IMAGE  = "ganeshbudhathoki/backend-app"
//         FRONTEND_IMAGE = "ganeshbudhathoki/frontend-app"
//         DOCKER_CRED_ID = "docker-hub-cred"
//         K8S_NAMESPACE  = "default"
//     }

//     stages {

//         stage('Checkout Code') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Docker Hub Login') {
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: DOCKER_CRED_ID,
//                     usernameVariable: 'DOCKER_USER',
//                     passwordVariable: 'DOCKER_PASS'
//                 )]) {
//                     sh '''
//                         echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
//                     '''
//                 }
//             }
//         }

//         stage('Build & Push Images') {
//             parallel {

//                 stage('Backend') {
//                     steps {
//                         sh '''
//                             docker build -t ${BACKEND_IMAGE}:latest backend
//                             docker push ${BACKEND_IMAGE}:latest
//                         '''
//                     }
//                 }

//                 stage('Frontend') {
//                     steps {
//                         sh '''
//                             docker build -t ${FRONTEND_IMAGE}:latest frontend
//                             docker push ${FRONTEND_IMAGE}:latest
//                         '''
//                     }
//                 }
//             }
//         }

//         stage('Test Kubernetes Access') {
//             steps {
//                 withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
//                     sh '''
//                         export KUBECONFIG=$KUBECONFIG
//                         kubectl version --client
//                         kubectl get nodes
//                     '''
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
//                     sh '''
//                         export KUBECONFIG=$KUBECONFIG

//                         kubectl apply -f k8s/backend-deployment.yaml -n ${K8S_NAMESPACE}
//                         kubectl apply -f k8s/frontend-deployment.yaml -n ${K8S_NAMESPACE}

//                         kubectl rollout restart deployment backend -n ${K8S_NAMESPACE}
//                         kubectl rollout restart deployment frontend -n ${K8S_NAMESPACE}
//                     '''
//                 }
//             }
//         }

//         stage('Verify Deployment') {
//             steps {
//                 withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
//                     sh '''
//                         export KUBECONFIG=$KUBECONFIG

//                         kubectl rollout status deployment backend -n ${K8S_NAMESPACE}
//                         kubectl rollout status deployment frontend -n ${K8S_NAMESPACE}

//                         kubectl get pods -n ${K8S_NAMESPACE}
//                     '''
//                 }
//             }
//         }
//     }

//     post {
//         success {
//             echo "🚀 CI/CD Pipeline completed successfully!"
//         }
//         failure {
//             echo "❌ Pipeline failed. Check logs."
//         }
//         always {
//             sh 'docker logout || true'
//         }
//     }
// }
pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "ganeshbudhathoki/backend-app"
        FRONTEND_IMAGE = "ganeshbudhathoki/frontend-app"
        DOCKER_CRED_ID = "docker-hub-cred"
        K8S_NAMESPACE  = "default"
        BUILD_TAG      = "${env.BUILD_NUMBER}"   // unique tag per build
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
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
                stage('Backend') {
                    steps {
                        sh '''
                            docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} backend
                            docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                        '''
                    }
                }
                stage('Frontend') {
                    steps {
                        sh '''
                            docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} frontend
                            docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                        '''
                    }
                }
            }
        }

        stage('Update Manifests') {
            steps {
                sh '''
                    sed -i "s|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${BUILD_TAG}|g" k8s/backend-deployment.yaml
                    sed -i "s|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${BUILD_TAG}|g" k8s/frontend-deployment.yaml

                    git config user.email "jenkins@ci.local"
                    git config user.name "Jenkins CI"
                    git add k8s/*.yaml
                    git commit -m "Update manifests to tag ${BUILD_TAG}"
                    git push origin main
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl apply -f k8s/backend-deployment.yaml -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s/frontend-deployment.yaml -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment backend -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment frontend -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "🚀 CI/CD Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check logs."
        }
        always {
            sh 'docker logout || true'
        }
    }
}
