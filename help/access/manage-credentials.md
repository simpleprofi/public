# Manage connection credentials


Typically, a connection to a data source requires access credentials. 
You can provide credentials either manually or by using [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/getting-started/).

If a connector requires access credentials, the connection properties dialog contains the **Credentials** field. 
By default, the field is set to **Manual** and disabled if no secrets manager is configured.

![Credentials field](/help/images/access/credentials-field.png)


## Use AWS Secrets Manager

Before you can use AWS Secrets Manager for credential management, you need to connect to your AWS account.

1. Click **Open** (![Open](/help/images/open-icon.png)) > **Databases** 
2. Right-click on the AWS connector and select **Add connection...**. 
3. Enter your AWS region, access key and secret key and give a name to this connection.     

Once your AWS account is connected to Datagrok, open the connection properties dialog.

1. In the **Credentials** field, select the name of the AWS connection.
2. in the **Secret Name**, select the name of the secret you want to use for this connection.
3. Click **TEST** to verify that the connection works. 

