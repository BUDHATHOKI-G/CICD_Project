pipeline {
    agent any
    environment {
        BACKEND_IMAGE = "ganeshbudhothoki/backend-app"
        FRONTEND_IMAGE = "ganeshbudhothoki/frontend-app"
        DOCKER_CRED_ID = "docker-hub-cred"
        K8S_NAMESPACE = "default" // Change if your namespace is different
    }

    triggers {
        // Automatically trigger on GitHub push
        pollSCM('* * * * *') // or set up webhook for true push trigger
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
                    // Automatically generate version: YYYYMMDD.HHMMSS
                    VERSION = new Date().format("yyyyMMdd.HHmmss")
                    env.VERSION = VERSION
                    echo "Building images with version: ${VERSION}"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}", 
                                                  usernameVariable: 'DOCKER_USER', 
                                                  passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }
            }
        }

        stage('Build and Push Docker Images') {
            parallel {
                stage('Backend') {
                    steps {
                        sh """
                        docker build --pull --cache-from ${BACKEND_IMAGE}:latest -t ${BACKEND_IMAGE}:${VERSION} backend
                        docker push ${BACKEND_IMAGE}:${VERSION}
                        """
                    }
                }
                stage('Frontend') {
                    steps {
                        sh """
                        docker build --pull --cache-from ${FRONTEND_IMAGE}:latest -t ${FRONTEND_IMAGE}:${VERSION} frontend
                        docker push ${FRONTEND_IMAGE}:${VERSION}
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Update image tags in Kubernetes manifests
                    sh """
                    sed -i 's|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${VERSION}|' k8s/backend-deployment.yaml
                    sed -i 's|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${VERSION}|' k8s/frontend-deployment.yaml
                    """

                    // Apply Kubernetes manifests
                    sh "kubectl apply -f k8s/backend-deployment.yaml -n ${K8S_NAMESPACE}"
                    sh "kubectl apply -f k8s/frontend-deployment.yaml -n ${K8S_NAMESPACE}"
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    // Verify Docker Hub images exist
                    sh """
                    if ! curl -s https://hub.docker.com/v2/repositories/ganeshbudhothoki/backend-app/tags/${VERSION}/ | grep -q '"name":'; then
                        echo "❌ Backend image ${BACKEND_IMAGE}:${VERSION} not found on Docker Hub!"
                        exit 1
                    fi
                    if ! curl -s https://hub.docker.com/v2/repositories/ganeshbudhothoki/frontend-app/tags/${VERSION}/ | grep -q '"name":'; then
                        echo "❌ Frontend image ${FRONTEND_IMAGE}:${VERSION} not found on Docker Hub!"
                        exit 1
                    fi
                    """

                    // Verify Kubernetes deployment images
                    sh """
                    BACKEND_DEPLOY_IMAGE=$(kubectl get deployment backend-deployment -n ${K8S_NAMESPACE} -o jsonpath="{.spec.template.spec.containers[0].image}")
                    FRONTEND_DEPLOY_IMAGE=$(kubectl get deployment frontend-deployment -n ${K8S_NAMESPACE} -o jsonpath="{.spec.template.spec.containers[0].image}")

                    if [ "$BACKEND_DEPLOY_IMAGE" != "${BACKEND_IMAGE}:${VERSION}" ]; then
                        echo "❌ Backend deployment image mismatch: $BACKEND_DEPLOY_IMAGE"
                        exit 1
                    fi
                    if [ "$FRONTEND_DEPLOY_IMAGE" != "${FRONTEND_IMAGE}:${VERSION}" ]; then
                        echo "❌ Frontend deployment image mismatch: $FRONTEND_DEPLOY_IMAGE"
                        exit 1
                    fi

                    echo "✅ Deployment verification passed!"
                    kubectl get pods -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }

    post {
        always {
            echo "✅ Pipeline finished."
        }
        failure {
            echo "❌ Pipeline failed. Check logs for details."
        }
    }
}
