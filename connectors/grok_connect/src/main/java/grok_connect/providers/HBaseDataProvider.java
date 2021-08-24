package grok_connect.providers;

import java.sql.*;
import java.util.*;
import grok_connect.utils.*;
import grok_connect.connectors_info.*;


public class HBaseDataProvider extends JdbcDataProvider {
    public HBaseDataProvider(ProviderManager providerManager) {
        super(providerManager);
        driverClassName = "org.apache.phoenix.queryserver.client.Driver";

        descriptor = new DataSource();
        descriptor.type = "HBase";
        descriptor.description = "Query HBase database";
        descriptor.connectionTemplate = new ArrayList<>(DbCredentials.dbConnectionTemplate);
        descriptor.connectionTemplate.add(new Property(Property.BOOL_TYPE, DbCredentials.SSL));
        descriptor.credentialsTemplate = DbCredentials.dbCredentialsTemplate;
    }

    public Connection getConnection(DataConnection conn) throws ClassNotFoundException, SQLException {
        Class.forName(driverClassName);
        java.util.Properties properties = defaultConnectionProperties(conn);
        if (!conn.hasCustomConnectionString()) {
            properties.setProperty("serialization", "PROTOBUF");
            if (conn.ssl())
                properties.setProperty("sslConnection", "true");
        }
        return CustomDriverManager.getConnection(getConnectionString(conn), properties, driverClassName);
    }

    public String getConnectionStringImpl(DataConnection conn) {
        String port = (conn.getPort() == null) ? "" : ":" + conn.getPort();
        return "jdbc:phoenix:thin:url=http://" + conn.getServer() + port;
    }
}
