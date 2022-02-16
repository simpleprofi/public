package grok_connect.providers;

import grok_connect.connectors_info.DataConnection;
import grok_connect.connectors_info.DataSource;
import grok_connect.connectors_info.DbCredentials;
import grok_connect.utils.Prop;
import grok_connect.utils.Property;
import grok_connect.utils.ProviderManager;

import java.util.ArrayList;
import java.util.Properties;

public class NeptuneProvider extends JdbcDataProvider {
    public NeptuneProvider(ProviderManager providerManager) {
        super(providerManager);
        driverClassName = "software.aws.neptune.NeptuneDriver";
//        software/aws/neptune/jdbc/Driver.class
        descriptor = new DataSource();
        descriptor.type = "Neptune";
        descriptor.description = "Query database via Neptune";
        descriptor.connectionTemplate = DbCredentials.dbConnectionTemplate;
        descriptor.credentialsTemplate = new ArrayList<Property>() {{
            add(new Property(Property.STRING_TYPE, "accessKey"));
            add(new Property(Property.STRING_TYPE, "secretKey", new Prop("password")));
        }};
    }

    public Properties getProperties(DataConnection conn) {
        java.util.Properties properties = new java.util.Properties();
        properties.setProperty("port", "8182");
        properties.setProperty("authScheme", "IAMSigV4");
        properties.setProperty("serviceRegion", "us-east-1");
        properties.setProperty("enableSsl", "true");
        properties.setProperty("useEncryption", "true");

        properties.setProperty("aws.accessKeyId", "___");
        properties.setProperty("aws.secretKey", "___");

        return properties;
    }
}
