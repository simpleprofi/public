# Data access v.2

The process of data analysis and data processing starts with getting the data. Datagrok provides an access to pretty much everything that is machine readable. Use it to access your [files][], [databases][], and [web services][]. ToDo: Add few more sentences here.


## Data sources

In Datagrok you can access and operate with the data located on or produced by different data sources. Here is the list of currently available options:

* [Files](#Files)
* [Databases](#Databases)
* [Web services](#Web-services)
* [Queries](#Queries)
* [Projects](#Projects)
* [Text](#Text)
* [Functions](#Functions)

## Files

Datagrok supports tabular and molecular file formats

### Tabular formats

| Extension  | Description                                      | 
|------------|--------------------------------------------------|
| .txt       | Plain text                                       | 
| .csv       | Comma-separated values                           | 
| .tsv       | Tab-separated values                             | 
| .xml       | Extensible Markup Language                       | 
| .json      | JavaScript Object Notation                       | 
| .HTML      | HyperText Markup Language                        | 
| .xlsx      | Excel                                            | 
| .edf       | European Data Format                             | 
| .sas7bdat  | SAS database file                                | 
| .kml, .kmz | Keyhole Markup Language (geographic annotations) | 
| .rds, .rda | R Data Format                                    | 
| .h5        | Hierarchical Data Format                         | 
| .nc        | NetCDF                                           | 
| .mat       | MATLAB MAT                                       | 
| .d42       | Datagrok project| 
| .zip       | ZIP archive                                      | 
| .gz, .gzip | gzip                                             | 
| .tar       | Tape archive                                     | 
| .ipynb     | Jupyter Notebook                                 | 

___

**Note:** there are plenty of scientific formats around and we have tools to extend list of supported formats with your very custom one. 
___

### Molecular formats

| Extension | Description                        | 
|-----------|------------------------------------|
| .cif      | Crystallographic Information File  |
| .pdb      | Protein Data Bank                  |
| .pqr      | PQR                                |
| .gro      | GROMACS                            |
| .sdf      | Structure-data file                |
| .mol      | MDL Molfile                        |
| .mol2     | SYBYL molecule representation      |
| .mmtf     | Macromolecular Transmission Format |

___

**Note:** you will need a nglviewer plugin to work with molecular formats
___

### Working with files

To start working with files you need to add them to Datagrok application first.

![](https://i.imgur.com/RoyQQwp.png)

Datagrok operates with both, files stored locally on your machine and with the cloud-based ones.

There are two ways to add a file stored on your local machine:

1. Click on **Open local file** on the toolbox menu and choose a file you want to add.
2. Drag a file from anywhere on your hard drive and drop it to one of the folders in Datagrok **Files** directory. 

In order to add data stored in a cloud-based storage, you need to create a **File share**.

### File share

File share represents a connection between Datagrok and your files on a cloud storage. Once you create a file share your cloud-based data will appear in the **Files** folder.

To create a file share, do the following:

![](https://i.imgur.com/gHbytiG.png)

1. Navigate to **Data**➝**Actions**
2. Click **New file share**
3. Select the type of cloud-based storage your files are located on
4. Fill out the credentials and click **OK**

___
**Note:** There are six file share options available in Datagrok:

* Dropbox
* Files
* Git
* Github
* Google Cloud
* Amazon S3

You can create a new custom connection if needed. To create a custom connection make a pull request to Datagrok public repository or [contact us]() for assistance.
___

### Files and folders sharing

![](https://i.imgur.com/ZILc6Vx.png)

If you are working in a team you will need a way to share data with your colleagues. In Datagrok you can do that in a few clicks. There are two sharing options available:

* Share a file
* Share a file as a data table

### Share a file

To share a file, do the following:

![](https://i.imgur.com/JdclGFn.png)

1. Navigate to the file you want to share in a Datagrok file browser
2. Double click the file to open it
3. Click on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/Fo07hLZ.png)</span> icon on the left hand side
4. Choose **File** sharing option
5. Enter the user name, group name, or email address of the user(s) you want to share your data with
6. Choose the permissions type from the drop down
7. If you want to notify users about sharing your files, hit the **Send notifications** checkbox and add a notification message to the typing area
8. Click on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/Sk2L9Yr.png)</span> icon to copy the link to your file
9. Click **OK** to confirm changes
10. Send the link you've copied to the users you want to share your file with

### Share a file as a data table


To share a file as a data table, do the following:

![](https://i.imgur.com/E9sDfcc.png)


1. Navigate to the file you want to share in a Datagrok file browser
2. Double click the file to open it
3. Click on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/Fo07hLZ.png)</span> icon on the left hand side
4. Choose **Data** sharing option
___
**Note:** Pay attention to the **Data sync** flag. It defines if users receive a static or real-time updated data. Once turned on, users will receive a fresh  data each time they re-open the file.
___

5. Click **OK** to upload your file and make it accessible by other users
6. Enter the user name, group name, or email address of the user(s) you want to share your data table with
7. Add an optional notification message, and click **OK**. Datagrok will send a link to your data table and notification message to the selected users automatically.

## Databases


Datagrok provides a way to connect to pretty much any Database out of the box. Here is the list of supported Databases:

![](https://i.imgur.com/liHUT84.png)

### Database connections

To access a database you need to create a database connection. The process is similar to creating a [file share](): 

![](https://i.imgur.com/PID1CLa.gif)


* Navigates to Files➝Databases 
* Click **Add New Connection** at the bottom of toolbox
* Choose the provider type
* Enter your credentials
* Click **Test** to check your connection
* Click **Ok** to confirm

A data connection is associated with the access credentials. In Datagrok these credentials can be specified either [manually]() or by integrating with a [secret manager]().

### Share database connection and objects

Each database connection and each shareable object inside of it has a sharing option.

![](https://i.imgur.com/HkkW5nK.gif)

To share a connection or an object, do the following:

* Once in Databases click on the connection or object you want to share
* Expand **Sharing** menu on the **Properties panel** and click **Share**
* Select the access right from the dropdown and a user or group to give the privileges
* Click **Ok** to confirm


### Database exploration

Datagrok lets you visually explore both database schema and database content via Hierarchy browser. Click on the item (such as connection, table, or column) and expand **Content** option on the **Properties panel**.

![](https://i.imgur.com/cPwVh9e.png)


Datagrok supports visual exploration of relational databases for some of the database providers, including PostgreSQL, MySQL, MS SQL, Maria DB, and Oracle. If a provider supports it, you'll see **Browse schema** command for the corresponding connection:

![](https://i.imgur.com/Xquo4pl.png)


### Schema browser


Schema browser visualizes all tables with all columns at once, giving you a high-level overview of the database. Click on a table to see its details in the property panel; it is also a good starting point for drill-downs and further exploration. 

![](https://i.imgur.com/jGyiZh6.gif)

### Context actions for db columns

In case you want to retrieve only some of the columns, select them (Shift+click) in the schema, and then use context actions that appear in the property panel.

## Queries

Data query defines which data should be extracted from the data source. For databases, that would typically be the SQL query; for Excel file, that would be sheet name, etc.

Queries can be executed either manually, or as part of the [Data Job](data-job.md). The result of executing a query is represented by the [Function Call](../overview/functions/function-call.md).

### Add a query

![](https://i.imgur.com/yExrUXP.gif)


* Select the database and open the context menu
* Choose **Add a query**
* Add query into the query editor
* Click on the green **Run** button at the top
* If you want to save the query --- set its name.
* Click **Save** to save the query for the future usage. You will be able to find it under the **Queries** tab.

### Share a query

![](https://i.imgur.com/bZXyN40.gif)

* Click on the query and open the context menu
* Choose **Share**
* Enter the user name or a group name
* Click **Ok** to confirm

___
**Note:** you can also share a query by using the query url. Before sending, make sure that the user you are sharing a url with does have a permission to access your query.
___

### Visual query

Visual query tool allow you to build a query with the help of visual interface.

![](https://i.imgur.com/XbnJsmT.gif)

* Choose columns you want to work with from the **Columns** dropdown
* Select the grouping option in the **Rows**
* Modify **Measures** as needed
* Set **Filters**

You receive the results immediately after modifying the query. The actual data aggregation is performed on a server. This feature is supported for all relational [data connectors](data-connection.md).

### Query builder 

Query builder helps to build a query for multiple tables using visual interface.

![](https://i.imgur.com/2QUnT1H.gif)

How to work with a query builder:

* Select a database table
* Open the context menu
* Choose **Build query**
* Hit the checkboxes with the data you want to include
* The preview of results is generated on the fly


## Web Services


In Datagrok you can work with API methods provided by Web Services that supports Open Api 2.0 and higher to receive and send data. To do so, import a Swagger (.yaml) file by dragging it into Datagrok view.

![](https://i.imgur.com/rbqmtP2.gif)

After dragging the files make sure that you fill out all the credentials. Then, you can double click on the selected method to send the request. In case of the GET request you will receive data transformed from the original response format (e.g. XML, or JSON) to the tabular view. 


## Projects

Project is a collection of entities along with the applied visualizations. Projects are used to group and share data and other assets with other users. One of the most common applications of projects are [dashboards]() that consist of tables (with either static or dynamic data), and visualizations applied to them.

### Create a project


![](https://i.imgur.com/XNXb7rw.gif)

* Open the data of interest
* Navigate to **Projects** on the sidebar
* Find your project under the strachpad and click **Upload**
* Set the project name and click **Ok**
* In case you want to share the project while uploading, select the users or groups you want to share it with and click **Ok**

___
**Note:** you can also create and share your project by clicking share icon located on the toolbox under the **File** menu
___

### Dynamic data

In the "Upload project" dialog, a "Data sync" option appears next to the tables that have a generation script defined. This option determines whether the data should be stored as a static snapshot, or as a generation script. In the latter case, the function will be re-executed whenever the project is opened.

### Project types

Projects are organized in a tree structure. Rights on particular [entities](objects.md) are inherited based on this hierarchy. There are two main types of projects: _root_ and _regular_. Root projects can contain one or more non-root projects, for example, the link `Demo:CoffeeCompany` indicates that the `CoffeeCompany` project is part of the root project `Demo`. Any link to an entity on the platform starts with the root project. And since an entity can have only one canonic address, other related projects will reference the link rather than the entity itself. This fact becomes important in the context of regular projects. As the name suggests, they are the most common ones (that's what users create by default). Entities from such a project belong to the higher-level namespace, which means they are tied to the root project. To find out where an entity comes from, see `Links` in the `Details` tab of the property panel.

Root projects are automatically created for users and packages. When the user uploads a project, it gets saved to their namespace. However, the existing entities will be available in the user's project via link. As for packages, each version has its own project, which allows sharing packages on a version level.

### Project gallery

Browse projects that are available to you. Use [Smart search](smart-search.md) for powerful filtering capabilities.

Click on the context menu to the left of the search box to control sort order, as well as access your recent searches.

Possible actions:

* Click --- Show in property panel
* Right click --- Open context menu
* Double click --- Open project

### Filtering Projects

The following fields can be used to filter projects with the [smart search](smart-search.md):

* name
* description
* createdOn
* updatedOn
* author
* starredBy
* commentedBy
* usedBy

## Text

Text functionality enables you to transform .csv files into a tabular data. 

![](https://i.imgur.com/N5HGxqe.gif)

Any changes made to the text or to the options are automatically applied, unless **Auto sync** option is off. The preview of the data is in the bottom pane.

Datagrok tries to detect the .csv structure patterns automatically, so vast majority of the datasets can be imported by simply dragging that file into the browser window, or opening it via the **Menu -> File -> Open** (Ctrl+O hotkey).

### Text structure options

You can setup the .csv files structure options by using the options on the left hand side of the Text view. 

Currently available text structure options:

* **Delimeter** --- a sign that defines the start of the new column. Can be set to "comma", "tab", "semicolon", "space", and "pipe". Default value --- "Auto"
* **New line** --- a sign that defines the start of the new line. Can be set to "\n" or "\r\n"
* **Decimal separator** --- a sign used as a decimal separator. Can be set to "," or "."
* **Thousands separator** --- a sign used as a thousands separator. Can be set to ',', ".", or " "
* **Treat as nulls** --- the list of values that should be treated as **null**
* **Headers** --- a flag that defines if the first line should be treated as a header
* **Merge delimeters** --- a flag that defines if Datagrok should treat consecutive delimeters as one
* **Autosync** --- a flag that defines if data frame should be parsed when the change is made

## Functions 

![](https://i.imgur.com/WAz6nAe.gif)

You can use [functions]() to return data in Datagrok. A function can be written in any language. There are several options to get a tabular data using functions: 

* [Call a method on the grok.data object]()
* [Call a Datagrok package built-in function]()
* [Call a data query function]()
* [Call a script function]()

Follow the [link]() to learn more about functions in Datagrok.
