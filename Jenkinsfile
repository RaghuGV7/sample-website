pipeline {
    agent any

    environment {
        // Define AWS and Chef paths or variables
        CHEF_HOME = '/home/jenkins/.chef'
        AWS_REGION = 'eu-west-2'
        EC2_USER = 'ec2-user'
        EC2_HOST = 'ec2-13-41-159-25.eu-west-2.compute.amazonaws.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    // Clone the Git repository containing the website
                    checkout scm
                }
            }
        }

        stage('Package Application') {
            steps {
                sh '''
                echo "Packaging application..."
                zip -r website.zip *
                '''
            }
        }

        stage('Upload Package to EC2') {
            steps {
                withCredentials([file(credentialsId: 'aws-ec2-key', variable: 'SSH_KEY_FILE')]) {
                    sh '''
                    chmod 600 $SSH_KEY_FILE
                    ssh -i $SSH_KEY_FILE -o StrictHostKeyChecking=no ec2-user@${EC2_IP} "echo Connected to EC2"
                    '''

                    sh '''
                    echo "Uploading package to EC2 instance..."
                    scp -i $SSH_KEY_FILE -o StrictHostKeyChecking=no website.zip $EC2_USER@$EC2_HOST:/tmp
                    '''
                }
            }
        }

        stage('Deploy with Chef') {
            steps {
                withCredentials([file(credentialsId: 'aws-ec2-key', variable: 'SSH_KEY_FILE')]) {
                    sh '''
                    echo "Running Chef to deploy application..."
                    knife bootstrap $EC2_HOST \
                        --ssh-user $EC2_USER \
                        --identity-file $SSH_KEY_FILE \
                        --node-name website-deployment \
                        --run-list 'recipe[website]'
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully!"
        }
        failure {
            echo "Deployment failed. Check logs for details."
        }
    }
}
