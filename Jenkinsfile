
pipeline {
    agent any

    environment {
        BACKEND_IMAGE  = "ganeshbudhathoki/backend-app"
        FRONTEND_IMAGE = "ganeshbudhathoki/frontend-app"
        DOCKER_CRED_ID = "docker-hub-cred"
        K8S_NAMESPACE  = "default"
        BUILD_TAG      = "${env.BUILD_NUMBER}"
        DEPLOY_BRANCH  = "deploy"
    }

    stages {

        stage('Checkout main (read-only)') {
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
                            docker build --no-cache -t ${BACKEND_IMAGE}:${BUILD_TAG} backend
                            docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                        '''
                    }
                }
                stage('Frontend') {
                    steps {
                        sh '''
                            docker build --no-cache -t ${FRONTEND_IMAGE}:${BUILD_TAG} frontend
                            docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                        '''
                    }
                }
            }
        }

        stage('Update Manifests (deploy branch only)') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-cred',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        git fetch origin

                        # Switch or create deploy branch
                        git checkout ${DEPLOY_BRANCH} || git checkout -b ${DEPLOY_BRANCH}
                        git reset --hard origin/${DEPLOY_BRANCH} || true

                        sed -i "s|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${BUILD_TAG}|g" k8s/backend-deployment.yaml
                        sed -i "s|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${BUILD_TAG}|g" k8s/frontend-deployment.yaml

                        git config user.email "jenkins@ci.local"
                        git config user.name "Jenkins CI"

                        git add k8s/*.yaml
                        git commit -m "Deploy image tag ${BUILD_TAG}" || echo "No changes to commit"

                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/BUDHATHOKI-G/CICD_Project.git ${DEPLOY_BRANCH}
                    '''
                }
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
