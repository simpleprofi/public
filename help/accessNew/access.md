# Data access


The process of data analysis and data processing starts with getting the data. Datagrok provides an access to pretty much everything that is machine readable. Use it to access your local [files](), [databases](), and [web services](). ToDo: Add more text here


## Data sources

In Datagrok you can access and operate with the data located on or produced by different data sources. Here is the list of currently available options:

* [Files](#Files) 
* [Databases](#Databases)
* [Web services](#Web-services)
* [Queries](#Queries)
* [Projects](#Projects)
* [Text](#Text)
* [Functions](#Functions)

## Supported data formats

Datagrok supports the following data formats out of a box:

| Extension     | Description              |
|---------------|--------------------------|
| csv, tsv, txt | Comma-separated file     |
| xml           | XML                      |
| json          | JSON                     |
| HTML          | HTML                     |
| xlsx          | Excel file               |
| edf           | European Data Format     |
| sas7bdat      | SAS                      |
| kml, kmz      | Geographic annotations   |
| rds, rda      | R Data Format            |
| h5            | Hierarchical Data Format |
| nc            | NetCDF                   |
| mat           | MATLAB MAT               |
| d42           | Datagrok project         |
| zip           | ZIP                      |
| gz, gzip      | gzip                     |
| tar           | tar                      |
| ipynb         | Jupyter Notebook         |

In case you feel like the list above is not complete, do not hesitate to [drop us message](). We have a built-in tool that can extend Datagrok to understand your very custom format.

## Files

To start working with files you need to add them to Datagrok application first.

![](https://i.imgur.com/RoyQQwp.png)

Datagrok operates with both, files stored locally on your machine and with the cloud-based ones.

There are two ways to add a file stored on your local machine:

1. Click on **Open local file** on the toolbox menu and choose a file you want to add.
2. Drag a file from anywhere on your hard drive and drop it to one of the folders in Datagrok **Files** directory. 

In order to add data stored in a cloud-based storage, you need to create a **File share**.

### File share

File share represents a connection between Datagrok and your files on a cloud storage. Once you create a file share your cloud-based data will appear in the **Files** folder

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


## File


---
* file share
* file system browser->file system browser structure
* file context menu
* file access privileges
* file sharing options
* data preview pane->folder preview/file preview (not only tabular structure but also the code view with highligts)

---

* Files

All files in Datagrok are stored in a file system uploaded to Amazon server(accessible from a server).
All your local files in Datagrok are stored under Data -> Files.


To open a file -> drag and drop

Note: This is the only step that can not be reproduced automatically

All files are accessible in a form of file shares.

To create a new file share Data->Files->Actions->New file share

6 types of file shares: Dropbox, Git, Github, Google Cloud, Amazon S3.

To create a file share: ****

after entering the credentials your connection will be established and connection will be created.

Local files are stored as Files connection type

## Databases

___

* Create Database Connection
* Share Database Conenction
* Check permissions/details
* Connect, explore, and work with Database
___

Datagrok provides a way to connect to pretty much any Database out of the box. Here is the list of support Databases:

![](https://i.imgur.com/1wxEsK5.png)


* 1
* 2
* 3
* 4

Note: we can add a custom connector on request. (check the for developers section). 

To create a new database connection Data->Files->Actions->Add new connection

Note: Different login credentials aree required depending on the chosen data provider.

Note: Login credentials are kept in a separate secured vault in an encrypted way that can only be encrypted with your login credentials (ASK Andrew).

Pay attention to properties pane while selection any object in the database connection. You may check sharing option etc... there  

To explore the table -> click on it and expand the content tab. By default it shows the first 50 rows

You can also check properties for each column.

Columns-> Inspect

## Queries

Note: You can share queries via url

**Visual Queries**

Visual queries are a good fit for queriyng databases that won't fit into memory or when you know exactly what you are looking for. Results are being diplayed instantly. 

Here you have Columns Rows Measures Filters. Right click to modify option

To make a visual query => Right click table -> Visual query.

Then, you can either save it as a query or add a dataframe to the workspace.

Can we now join multiple tables? How? What is interrogate? (Ask Andrew)

Pivot column (Ask Andrew)

Note: Datagrok uses the out of the box aggregations provided by database providers. But you can define custom aggregation functions to each provider using connectors (opensource git stuff).

**Query Builder** is for combining tables

**Parameterized Queries** 

TODO: Make Query as a subtopic and include all types of queries there. 

**Queries**

How does query get to the Queries? Should you create one in some kind of query builder first? Is there a New query option? (Ask Andrew)

To run a query: Data->Database->Select Database->Rightclick query->Run

Parameter Patterns? (Ask Andrew)

**Query Transformations**

Note: Python script that accepts a table and returns a table can be used as transformation step.

## Web services

Has the collection of open api methods

Import Open API or swagger file. -> Simply drag and drop. 

Webservice credentials (where to get where to store? ask andrew)


Note: you can check the previously used parameters by clicking on the <span style=" display: inline-block; width:20px;">![](https://i.imgur.com/4XSx1Jy.png)</span> icon.

Data returned from response are returned in a way that API allows you and then Datagrok transforms it into a tabular 

Note: there is custom processing.

**Functions and scripts as data sources**

Function generated data. Provide a short description. Link to **Functions**.

Functions and scripts can be executed either in the browser or on a server. 

You can include (for exmaple macroses with functions) in your dashboard. What is a dashboard? (ask Andrew)

Script generated data. Provide a short description. Scripts vs Functions? (ask andrew or investigate) Link to scripts.

**Dashboards**

???

## Projects

Project is a collection of entities along with the applied visualizations. Projects are used to group and share data and
other assets with other users. One of the most common applications of projects are dashboards that consist of tables (
with either static or dynamic data), and visualizations applied to them.

### Uploading a project

Creating a project is easy. After getting the data of interest in the scratchpad project in [workspace](workspace.md),
click on the `UPLOAD` button. After the project gets uploaded to the server, a separate window pops us asking you whom
to share the project with. By default, it is only accessible by you, you have to share it in order for others to use it.

Or, if you are editing an existing project, click `SAVE` to save your changes.

Use `Share` context action to edit access permissions. Sharing a project will automatically share all entities and data
inside.

### Dynamic data

Whenever a table is created by executing a [function](../overview/functions)
(such as a [database query](../access/data-query.md)), this information gets stored with the table as a "generation
script". This serves multiple purposes:

* Provides data lineage
* On-demand data refreshing (Table toolbox, "Query" panel, `REFRESH` button)
* Enables publishing dashboards with the dynamic data

In the "Upload project" dialog, a "Data sync" option appears next to the tables that have a generation script defined.
This option determines whether the data should be stored as a static snapshot, or as a generation script. In the latter
case, the function will be re-executed whenever the project is opened.

![project-upload-data-sync](project-upload-data-sync.png)

### Project types

Projects are organized in a tree structure. Rights on particular [entities](objects.md) are inherited based on this
hierarchy. There are two main types of projects: _root_ and _regular_. Root projects can contain one or more non-root
projects, for example, the link `Demo:CoffeeCompany`
indicates that the `CoffeeCompany` project is part of the root project `Demo`. Any link to an entity on the platform
starts with the root project. And since an entity can have only one canonic address, other related projects will
reference the link rather than the entity itself. This fact becomes important in the context of regular projects. As the
name suggests, they are the most common ones
(that's what users create by default). Entities from such a project belong to the higher-level namespace, which means
they are tied to the root project. To find out where an entity comes from, see `Links` in the `Details` tab of the
property panel.

Root projects are automatically created for users and packages. When the user uploads a project, it gets saved to their
namespace. However, the existing entities will be available in the user's project via link. As for packages, each
version has its own project, which allows sharing packages on a version level.

### Project gallery

Browse projects that are available to you. Use [Smart search](smart-search.md) for powerful filtering capabilities.

Click on the context menu to the left of the search box to control sort order, as well as access your recent searches.

Controls:

|              |                        |
|--------------|------------------------|
| Click        | Show in property panel |
| Right click  | Context menu           |
| Double click | Open                   |

### Filtering

The following fields could be used to filter projects with [smart search](smart-search.md):

| Field        | Description                                 |
|--------------|---------------------------------------------|
| name         |                                             |
| description  |                                             |
| createdOn    |                                             |
| updatedOn    |                                             |
| author       | [User](../govern/user.md) object            |
| starredBy    | [User](../govern/user.md) object            |
| commentedBy  | [User](../govern/user.md) object            |
| usedBy       | [User](../govern/user.md) object            |


## Text

# Import text

Use this feature for finer control of the import options, as well as text editing.

Any changes made to the text or to the options are automatically applied, unless 'Auto sync' option is off. The preview
of the data is in the bottom pane.

Datagrok tries to auto-detect parameters automatically, so vast majority of the datasets can be imported by simply
dragging that file into the browser window, or opening it via the **File | Open (
Ctrl+O)** command.

Options and commands:

|                     |                                                                |
|---------------------|----------------------------------------------------------------|
| Delimiter           | Field separator                                                |
| New line            | New line                                                       |
| Decimal separator   | Decimal separator                                              |
| Thousands separator | Thousands separator                                            |
| Headers             | Treat first line as headers                                    |
| Auto sync           | Parse data on every change (might be slow if the table is big) |
| Load                | Load file                                                      |
| Sync                | Force synchronization                                          |
| Done                | Add the table to the workspace                                 |


### Supported data source providers(probably change to logos)

| Data Source Provider             |
|----------------------------------|
| Access                           |
| Amazon S3                        |
| Amazon Athena                    |
| Amazon Redshift                  |
| Google BigQuery                  |
| Google Cloud                     |
| Cassandra                        |
| DB2                              |
| Dropbox                          |
| File Network Shares              |
| Firebird                         |
| HBase                            |
| Hive                             |
| MS SQL                           |
| MariaDB                          |
| MongoDB                          |
| MySQL                            |
| ODATA                            |
| Oracle                           |
| PostgreSQL                       |
| SQLite                           |
| [Socrata](edit-socrata-query.md) |
| Sparql                           |
| Teradata                         |
| Twitter                          |
| Vertica                          |
