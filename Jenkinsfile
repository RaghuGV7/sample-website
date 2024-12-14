pipeline {
    agent any

    environment {
        // Define AWS and Chef paths or variables
        CHEF_HOME = '/home/jenkins/.chef'
        AWS_REGION = 'us-east-1'
        SSH_KEY = '/path/to/aws-ec2-key.pem'
        EC2_USER = 'ec2-user'
        EC2_HOST = 'ec2-public-ip-address'
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
                sh '''
                echo "Uploading package to EC2 instance..."
                scp -i $SSH_KEY website.zip $EC2_USER@$EC2_HOST:/tmp
                '''
            }
        }

        stage('Deploy with Chef') {
            steps {
                sh '''
                echo "Running Chef to deploy application..."
                knife bootstrap $EC2_HOST \
                    --ssh-user $EC2_USER \
                    --identity-file $SSH_KEY \
                    --node-name website-deployment \
                    --run-list 'recipe[website]'
                '''
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
