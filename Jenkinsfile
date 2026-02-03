
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
        GIT_CRED_ID    = "github-cred"

        K8S_MANIFEST_PATH = "k8s"
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

        stage('Generate Version') {
            steps {
                script {
                    env.VERSION = new Date().format("yyyyMMdd.HHmmss")
                    echo "🔖 Version: ${VERSION}"
                }
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKER_CRED_ID,
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
            }
        }

        stage('Build & Push Images') {
            parallel {

                stage('Backend Image') {
                    steps {
                        sh """
                        docker build -t ${BACKEND_IMAGE}:${VERSION} backend
                        docker push ${BACKEND_IMAGE}:${VERSION}
                        """
                    }
                }

                stage('Frontend Image') {
                    steps {
                        sh """
                        docker build -t ${FRONTEND_IMAGE}:${VERSION} frontend
                        docker push ${FRONTEND_IMAGE}:${VERSION}
                        """
                    }
                }
            }
        }

        stage('Update Kubernetes Manifests (GitOps)') {
            steps {
                sh """
                sed -i 's|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${VERSION}|' \
                    ${K8S_MANIFEST_PATH}/backend-deployment.yaml

                sed -i 's|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${VERSION}|' \
                    ${K8S_MANIFEST_PATH}/frontend-deployment.yaml
                """
            }
        }

        stage('Commit & Push Manifest Changes') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: GIT_CRED_ID,
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh """
                    git config user.name "jenkins"
                    git config user.email "jenkins@ci.local"

                    git add ${K8S_MANIFEST_PATH}
                    git commit -m "chore(deploy): release ${VERSION}" || echo "No changes"
                    git push https://${GIT_USER}:${GIT_TOKEN}@github.com/BUDHATHOKI-G/CICD_Project.git HEAD:main
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ CI complete. Argo CD will deploy automatically."
        }
        failure {
            echo "❌ CI failed."
        }
        always {
            sh 'docker logout || true'
        }
    }
}
