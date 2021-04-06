var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
    function rejected(value) { try { step(generator['throw'](value)); } catch (e) { reject(e); } }
    function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
define(['require', 'exports', './entities', './view', './wrappers'], function (require, exports, entities_1, view_1, wrappers_1) {
  'use strict';
  Object.defineProperty(exports, '__esModule', { value: true });
  exports.Logger = exports.Files = exports.TablesDataSource = exports.UserDataStorage = exports.PermissionsDataSource = exports.LayoutsDataSource = exports.CredentialsDataSource = exports.EntitiesDataSource = exports.GroupsDataSource = exports.AdminDataSource = exports.UsersDataSource = exports.HttpDataSource = exports.Dapi = void 0;
  let api = window;
  /**
     * Exposes Datagrok's server-side functionality.
     *
     * See examples: {@link https://public.datagrok.ai/js/samples/dapi/projects-list}
     * */
  class Dapi {
    constructor() {
    }
    /** Retrieves entities from server by list of IDs
         *  @returns {Promise<List<Entity>>} */
    getEntities(ids) {
      return new Promise((resolve, reject) => api.grok_Dapi_Entities_GetEntities(ids, (q) => {
        return resolve(q.map(wrappers_1.toJs));
      }, (e) => reject(e)));
    }
    /** Entities API endpoint
         *  @type {EntitiesDataSource} */
    get entities() {
      return new EntitiesDataSource(api.grok_Dapi_Entities(), (a) => new entities_1.Entity(a));
    }
    /** Data Queries API endpoint
         *  @type {HttpDataSource<DataQuery>} */
    get queries() {
      return new HttpDataSource(api.grok_Dapi_Queries(), (a) => new entities_1.DataQuery(a));
    }
    /** Data Connections API endpoint
         *  @type {HttpDataSource<DataConnection>} */
    get connections() {
      return new HttpDataSource(api.grok_Dapi_Connections(), (a) => new entities_1.DataConnection(a));
    }
    /** Credentials API endpoint
         *  @type {CredentialsDataSource} */
    get credentials() {
      return new CredentialsDataSource(api.grok_Dapi_Credentials(), (a) => new entities_1.Credentials(a));
    }
    /** Data Jobs API endpoint
         *  @type {HttpDataSource<DataJob>} */
    get jobs() {
      return new HttpDataSource(api.grok_Dapi_Jobs(), (a) => new entities_1.DataJob(a));
    }
    /** Jupyter Notebooks API endpoint
         *  @type {HttpDataSource<Notebook>} */
    get notebooks() {
      return new HttpDataSource(api.grok_Dapi_Notebooks(), (a) => wrappers_1.toJs(a));
    }
    /** Predictive Models API endpoint
         *  @type {HttpDataSource<Model>} */
    get models() {
      return new HttpDataSource(api.grok_Dapi_Models(), (a) => new entities_1.Model(a));
    }
    /** Packages API endpoint
         *  @type {HttpDataSource<Package>} */
    get packages() {
      return new HttpDataSource(api.grok_Dapi_Packages(), (a) => new entities_1.Package(a));
    }
    /** View Layouts API endpoint
         *  @type {LayoutsDataSource} */
    get layouts() {
      return new LayoutsDataSource(api.grok_Dapi_Layouts(), (a) => new view_1.ViewLayout(a));
    }
    /** Data Table Infos API endpoint
         *  @type {TablesDataSource} */
    get tables() {
      return new TablesDataSource(api.grok_Dapi_Tables(), (a) => new entities_1.TableInfo(a));
    }
    /** Users API endpoint
         *  @type {UsersDataSource} */
    get users() {
      return new UsersDataSource(api.grok_Dapi_Users(), (a) => new entities_1.User(a));
    }
    /** Groups API endpoint
         *  @type {GroupsDataSource} */
    get groups() {
      return new GroupsDataSource(api.grok_Dapi_Groups(), (a) => wrappers_1.toJs(a));
    }
    /** Permissions API endpoint
         * @type {PermissionsDataSource} */
    get permissions() {
      return new PermissionsDataSource();
    }
    /** Scripts API endpoint
         *  @type {HttpDataSource<Script>} */
    get scripts() {
      return new HttpDataSource(api.grok_Dapi_Scripts(), (a) => new entities_1.Script(a));
    }
    /** Projects API endpoint
         *  @type {HttpDataSource<Project>} */
    get projects() {
      return new HttpDataSource(api.grok_Dapi_Projects(), (a) => new entities_1.Project(a));
    }
    /** Environments API endpoint
         *  @type {HttpDataSource<ScriptEnvironment>} */
    get environments() {
      return new HttpDataSource(api.grok_Dapi_Environments(), (a) => new entities_1.ScriptEnvironment(a));
    }
    /** Users Data Storage API endpoint
         *  @type {UserDataStorage} */
    get userDataStorage() {
      return new UserDataStorage();
    }
    /** Users Files management API endpoint
         *  @type {Files} */
    get files() {
      return new Files();
    }
    /** Proxies URL request via Datagrok server with same interface as "fetch".
         * @deprecated
         * @param {string} method
         * @param {string} url
         * @param {Object} headers
         * @param {Object} body
         * @returns {Promise<Object>} */
    proxyFetch(method, url, headers, body = {}) {
      return __awaiter(this, void 0, void 0, function* () {
        headers['Accept'] = 'application/json';
        headers['original-url'] = `${url}`;
        headers['original-method'] = method;
        let params = {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body)
        };
        return yield fetch('/api/connectors/proxy', params);
      });
    }
    /** Proxies URL request via Datagrok server with same interface as "fetch".
         * @param {String} url
         * @param {Object} params
         * @returns {Promise<Object>} */
    fetchProxy(url, params) {
      return __awaiter(this, void 0, void 0, function* () {
        if (params == null)
          params = {};
        if (params.headers == null)
          params.headers = {};
        if (params.method == null)
          params.method = 'GET';
        // @ts-ignore
        params.headers['original-url'] = `${url}`;
        // @ts-ignore
        params.headers['original-method'] = params.method;
        params.method = 'POST';
        return fetch('/api/connectors/proxy', params);
      });
    }
    /** Administering API endpoint
         *  @type {AdminDataSource} */
    get admin() {
      return new AdminDataSource(api.grok_Dapi_Admin());
    }
    /** Logging API endpoint
         *  @type {HttpDataSource<LogEvent>} */
    get log() {
      return new HttpDataSource(api.grok_Dapi_Log(), (a) => new entities_1.LogEvent(a));
    }
    /** Logging API endpoint
         *  @type {HttpDataSource<LogEventType>} */
    get logTypes() {
      return new HttpDataSource(api.grok_Dapi_LogTypes(), (a) => new entities_1.LogEventType(a));
    }
  }
  exports.Dapi = Dapi;
  /**
     * Common functionality for handling collections of entities stored on the server.
     * Works with Datagrok REST API, allows to get filtered and paginated lists of entities,
     * Can be extended with specific methods. (i.e. {@link UsersDataSource})
     */
  class HttpDataSource {
    /** @constructs HttpDataSource */
    constructor(s, instance) {
      this.s = s;
      this.entityToJs = instance;
    }
    /** Returns all entities that satisfy the filtering criteria (see {@link filter}).
         *  See examples: {@link https://public.datagrok.ai/js/samples/dapi/projects-list}
         *  Smart filter: {@link https://datagrok.ai/help/overview/smart-search}
         *  @param {Object} options
         *  @param {int} options.pageSize
         *  @param {int} options.pageNumber
         *  @param {string} options.order
         *  @param {string} options.filter
         *  @returns {Promise<object[]>}  */
    list(options = {}) {
      if (options.pageSize !== undefined)
        this.by(options.pageSize);
      if (options.pageNumber !== undefined)
        this.page(options.pageNumber);
      if (options.filter !== undefined)
        this.filter(options.filter);
      if (options.order !== undefined)
        this.order(options.order);
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_DataSource_List(this.s, (q) => resolve(q.map(s)), (e) => reject(e)));
    }
    /** Returns fist entity that satisfy the filtering criteria (see {@link filter}).
         *  @returns Promise<object>  */
    first() {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_DataSource_First(this.s, (q) => resolve(s(q)), (e) => reject(e)));
    }
    /** Returns an entity with the specified id.
         *  Throws an exception if an entity does not exist, or is not accessible in the current context.
         *  @param {string} id - GUID of the corresponding object
         *  @returns {Promise<object>} - entity. */
    find(id) {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_DataSource_Find(this.s, id, (q) => resolve(s(q)), (e) => reject(e)));
    }
    /** Saves an entity
         *  @param {Entity} e
         *  @returns {Promise} - entity. */
    save(e) {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_DataSource_Save(this.s, e.d, (q) => resolve(s(q)), (e) => reject(e)));
    }
    /** Deletes an entity
         *  @param {Entity} e
         *  @returns {Promise} */
    delete(e) {
      return new Promise((resolve, reject) => api.grok_DataSource_Delete(this.s, e.d, () => resolve(), (e) => reject(e)));
    }
    by(i) {
      this.s = api.grok_DataSource_By(this.s, i);
      return this;
    }
    page(i) {
      this.s = api.grok_DataSource_Page(this.s, i);
      return this;
    }
    /** Returns next page of all entities that satisfy the filtering criteria (see {@link filter}).
         *  Works only if pageSize was set during previous list() call
         *  See examples: {@link https://public.datagrok.ai/js/samples/dapi/projects-list}
         *  @returns {HttpDataSource} */
    nextPage() {
      this.s = api.grok_DataSource_NextPage(this.s);
      return this;
    }
    /** Applies filter to current request.
         *  Also can be set with {@link list} method "options" parameter
         *  See example: {@link https://public.datagrok.ai/js/samples/dapi/projects-list}
         *  Smart filter: {@link https://datagrok.ai/help/overview/smart-search}
         *  @param {string} w
         *  @returns {HttpDataSource} */
    filter(w) {
      this.s = api.grok_DataSource_WhereSmart(this.s, w);
      return this;
    }
    /** Instructs data source to return results in the specified order.
         * @param {string} fieldName
         * @param {boolean} desc
         * @returns {HttpDataSource} */
    order(fieldName, desc = false) {
      this.s = api.grok_DataSource_Order(this.s, fieldName, desc);
      return this;
    }
    /** Includes entity in the result
         * @param {string} include
         * @returns {HttpDataSource} */
    include(include) {
      this.s = api.grok_DataSource_Include(this.s, include);
      return this;
    }
  }
  exports.HttpDataSource = HttpDataSource;
  /**
     * Functionality for handling Users collection from server and working with Users remote endpoint
     * Allows to load current user and list of all Datagrok users with filtering and pagination
     * See example: {@link https://public.datagrok.ai/js/samples/dapi/who-am-i}
     * @extends HttpDataSource
     * */
  class UsersDataSource extends HttpDataSource {
    /** @constructs UsersDataSource*/
    constructor(s, instance) {
      super(s, instance);
    }
    /** Returns current user
         * @returns {Promise<User>} */
    current() {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_UsersDataSource_Current(this.s, (q) => resolve(s(q)), (e) => reject(e)));
    }
    /** Returns current session
         * @returns {Promise<UserSession>} */
    currentSession() {
      return new Promise((resolve, reject) => api.grok_UsersDataSource_CurrentSession(this.s, (q) => resolve(wrappers_1.toJs(q)), (e) => reject(e)));
    }
  }
  exports.UsersDataSource = UsersDataSource;
  class AdminDataSource {
    /** @constructs AdminDataSource*/
    constructor(s) {
      this.s = s;
    }
    /** Returns information about the services
         *  @returns {Promise<Map>} */
    getServiceInfos() {
      return new Promise((resolve, reject) => api.grok_Dapi_Admin_GetServiceInfos(this.s, (q) => resolve(wrappers_1.toJs(q)), (e) => reject(e)));
    }
  }
  exports.AdminDataSource = AdminDataSource;
  /**
     * Functionality for handling groups collection from server
     * Allows to manage {@link Group}
     * @extends HttpDataSource
     * */
  class GroupsDataSource extends HttpDataSource {
    /** @constructs CredentialsDataSource*/
    constructor(s, instance) {
      super(s, instance);
    }
    /** Creates a new group
         *  @param {String}  name
         *  @returns {Promise<Group>} - Group. */
    createNew(name) {
      let g = new entities_1.Group(api.grok_Group(name));
      return this.save(g);
    }
    /** Returns group user
         *  @param {Group} group
         *  @returns {Promise<Group>} - Group. */
    getUser(group) {
      return new Promise((resolve, reject) => api.grok_Dapi_Get_GroupUser(group.d, (q) => resolve(wrappers_1.toJs(q)), (e) => reject(e)));
    }
    /** Adds a member to the group
         * @param {Group} g
         * @param {Group} m
         * @returns {Promise} */
    addMember(g, m) {
      return __awaiter(this, void 0, void 0, function* () {
        g = yield this.find(g.id);
        g.addMember(m);
        yield this.saveRelations(g);
      });
    }
    /** Adds an admin member to the group
         * @param {Group} g
         * @param {Group} m
         * @returns {Promise} */
    addAdminMember(g, m) {
      return __awaiter(this, void 0, void 0, function* () {
        g = yield this.find(g.id);
        g.addAdminMember(m);
        yield this.saveRelations(g);
      });
    }
    /** Removes a member from the group
         * @param {Group} g
         * @param {Group} m
         * @returns {Promise} */
    removeMember(g, m) {
      return __awaiter(this, void 0, void 0, function* () {
        g = yield this.find(g.id);
        g.removeMember(m);
        yield this.saveRelations(g);
      });
    }
    /** Adds the group to another one
         * @param {Group} g
         * @param {Group} parent
         * @returns {Promise} */
    includeTo(g, parent) {
      return __awaiter(this, void 0, void 0, function* () {
        g = yield this.find(g.id);
        g.includeTo(parent);
        yield this.saveRelations(g);
      });
    }
    /** Adds the group to another one as admin
         * @param {Group} g
         * @param {Group} parent
         * @returns {Promise} */
    includeAdminTo(g, parent) {
      return __awaiter(this, void 0, void 0, function* () {
        g = yield this.find(g.id);
        g.includeAdminTo(parent);
        yield this.saveRelations(g);
      });
    }
    /** Removes a membership from the group
         * @param {Group} g
         * @param {Group} parent
         * @returns {Promise} */
    excludeFrom(g, parent) {
      return __awaiter(this, void 0, void 0, function* () {
        g = yield this.find(g.id);
        g.excludeFrom(parent);
        yield this.saveRelations(g);
      });
    }
    /** Saves a group with relations
         *  @param {Group} e
         *  @returns {Promise<Group>} - Group. */
    saveRelations(e) {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_GroupsDataSource_Save(this.s, e.d, (q) => resolve(s(q)), (e) => reject(e)));
    }
  }
  exports.GroupsDataSource = GroupsDataSource;
  /**
     * Functionality for handling entities collection from server
     * Allows to manage {@link Entity}
     * @extends HttpDataSource
     * */
  class EntitiesDataSource extends HttpDataSource {
    /** @constructs CredentialsDataSource*/
    constructor(s, instance) {
      super(s, instance);
    }
    /** Allows to set properties for entities
         * @param {List<Map>} props
         * @returns {Promise} */
    saveProperties(props) {
      return new Promise((resolve, reject) => api.grok_EntitiesDataSource_SaveProperties(this.s, props, (_) => resolve(), (e) => reject(e)));
    }
    /** Returns entity properties
         * @param {Entity} entity
         * @returns {Promise<Map>} props */
    getProperties(entity) {
      return new Promise((resolve, reject) => api.grok_EntitiesDataSource_GetProperties(this.s, entity.d, (p) => resolve(p), (e) => reject(e)));
    }
    /** Deletes entity properties
         * @param {List<Map>} props
         * @returns {Promise} */
    deleteProperties(props) {
      return new Promise((resolve, reject) => api.grok_EntitiesDataSource_DeleteProperties(this.s, props, (_) => resolve(), (e) => reject(e)));
    }
  }
  exports.EntitiesDataSource = EntitiesDataSource;
  /**
     * Functionality for handling credentials collection from server and working with credentials remote endpoint
     * Allows to manage {@link Credentials}
     * See also: {@link https://datagrok.ai/help/govern/security}
     * @extends HttpDataSource
     * */
  class CredentialsDataSource extends HttpDataSource {
    /** @constructs CredentialsDataSource*/
    constructor(s, instance) {
      super(s, instance);
    }
    /** Returns credentials for entity
         * @param {Entity} e
         * @returns {Promise<Credentials>} */
    forEntity(e) {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_CredentialsDataSource_ForEntity(this.s, e.d, (c) => resolve(s(c)), (e) => reject(e)));
    }
  }
  exports.CredentialsDataSource = CredentialsDataSource;
  /**
     * Functionality for handling layouts collection from server
     * Allows to manage {@link ViewLayout}
     * @extends HttpDataSource
     * */
  class LayoutsDataSource extends HttpDataSource {
    /** @constructs CredentialsDataSource*/
    constructor(s, instance) {
      super(s, instance);
    }
    /** Returns layouts that applicable to the table
         * @param {DataFrame} t
         * @returns {Promise<List<ViewLayout>>} */
    getApplicable(t) {
      let s = this.entityToJs;
      return new Promise((resolve, reject) => api.grok_LayoutsDataSource_Applicable(this.s, t.d, (q) => resolve(q.map(s)), (e) => reject(e)));
    }
  }
  exports.LayoutsDataSource = LayoutsDataSource;
  class PermissionsDataSource {
    constructor() {
    }
    ;
    /** Gets all the permissions granted on entity
         * @param {Entity} e
         * @returns {Promise<Map>} permissions
         * */
    // { [key:string]:number; }
    get(e) {
      return new Promise((resolve, reject) => api.grok_Dapi_Get_Permissions(e.d, (data) => {
        data.view = wrappers_1.toJs(data.view);
        data.edit = wrappers_1.toJs(data.edit);
        resolve(data);
      }, (e) => reject(e)));
    }
    /** Grants permission on entity to the group
         * @param {Entity} e
         * @param {Group} g
         * @param {boolean} edit allow to edit entity
         * @returns {Promise}
         * */
    grant(e, g, edit) {
      return new Promise((resolve, reject) => api.grok_Dapi_Set_Permission(e.d, g.d, edit, (data) => resolve(data), (e) => reject(e)));
    }
    /** Revokes permission on entity from the group
         * @param {Entity} e
         * @param {Group} g
         * @returns {Promise}
         * */
    revoke(g, e) {
      return new Promise((resolve, reject) => api.grok_Dapi_Delete_Permission(e.d, g.d, (data) => resolve(data), (e) => reject(e)));
    }
  }
  exports.PermissionsDataSource = PermissionsDataSource;
  /**
     * Functionality for working with remote Users Data Storage
     * Remote storage allows to save key-value pairs on the Datagrok server for further use
     * */
  class UserDataStorage {
    constructor() {
    }
    /** Saves a single value to Users Data Storage
         * @param {string} name Storage name
         * @param {string} key
         * @param {string} value
         * @param {boolean} currentUser Value should be available only for current user
         * @returns {Promise}*/
    postValue(name, key, value, currentUser = true) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserDataStorage_PostValue(name, key, value, currentUser, () => resolve(), (e) => reject(e)));
    }
    /** Saves a map to Users Data Storage, will be appended to existing data
         * @param {string} name Storage name
         * @param {Map} data
         * @param {boolean} currentUser Value should be available only for current user
         * @returns {Promise}*/
    post(name, data, currentUser = true) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserDataStorage_Post(name, data, currentUser, () => resolve(), (e) => reject(e)));
    }
    /** Saves a map to Users Data Storage, will replace existing data
         * @param {string} name Storage name
         * @param {Map} data
         * @param {boolean} currentUser Value should be available only for current user
         * @returns {Promise}*/
    put(name, data, currentUser = true) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserDataStorage_Put(name, data, currentUser, () => resolve(), (e) => reject(e)));
    }
    /** Retrieves a map from Users Data Storage
         * @param {string} name Storage name
         * @param {boolean} currentUser get a value from a current user storage
         * @returns {Promise<Map>} */
    get(name, currentUser = true) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserDataStorage_Get(name, currentUser, (data) => resolve(data), (e) => reject(e)));
    }
    /** Retrieves a single value from Users Data Storage
         * @param {string} name Storage name
         * @param {string} key Value key
         * @param {boolean} currentUser get a value from a current user storage
         * @returns {Promise<string>} */
    getValue(name, key, currentUser = true) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserDataStorage_GetValue(name, key, currentUser, (value) => resolve(value), (e) => reject(e)));
    }
    /** Removes a single value from Users Data Storage
         * @param {string} name Storage name
         * @param {string} key Value key
         * @param {boolean} currentUser get a value from a current user storage
         * @returns {Promise} */
    remove(name, key, currentUser = true) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserDataStorage_Delete(name, key, currentUser, () => resolve(), (e) => reject(e)));
    }
  }
  exports.UserDataStorage = UserDataStorage;
  /**
     * Functionality for working with remote tables
     * @extends HttpDataSource
     * */
  class TablesDataSource extends HttpDataSource {
    /** @constructs TablesDataSource*/
    constructor(s, instance) {
      super(s, instance);
    }
    /** @returns {Promise<string>} */
    uploadDataFrame(dataFrame) {
      return new Promise((resolve, reject) => api.grok_Dapi_TablesDataSource_UploadDataFrame(dataFrame.d, (id) => resolve(id), (e) => reject(e)));
    }
    /**
         * @param {string} id
         * @returns {Promise<DataFrame>} */
    getTable(id) {
      return new Promise((resolve, reject) => api.grok_Dapi_TablesDataSource_GetTable(id, (df) => resolve(wrappers_1.toJs(df)), (e) => reject(e)));
    }
  }
  exports.TablesDataSource = TablesDataSource;
  class Files {
    constructor() {
    }
    ;
    /** Check if file exists
         * @param {FileInfo | string} file
         * @returns {Promise<Boolean>} */
    exists(file) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_Exists(file, (data) => resolve(data), (e) => reject(e)));
    }
    /** Delete file
         * @param {FileInfo | string} file
         * @returns {Promise} */
    delete(file) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_Delete(file, () => resolve(), (e) => reject(e)));
    }
    /** Move file
         * @param {List<FileInfo | string>} files
         * @param {string} newPath
         * @returns {Promise} */
    move(files, newPath) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_Move(files, newPath, () => resolve(), (e) => reject(e)));
    }
    /** Rename file
         * @param { FileInfo | string} file
         * @param {string} newName
         * @returns {Promise} */
    rename(file, newName) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_Rename(file, newName, () => resolve(), (e) => reject(e)));
    }
    /** List file
         * @param {FileInfo | string} file
         * @param {boolean} recursive
         * @param {string} searchPattern
         * @returns {Promise<List<FileInfo>>} */
    list(file, recursive, searchPattern) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_List(file, recursive, searchPattern, (data) => resolve(wrappers_1.toJs(data)), (e) => reject(e)));
    }
    /** Read file as string
         * @param {FileInfo | string} file
         * @returns {Promise<String>} */
    readAsText(file) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_ReadAsText(file, (data) => resolve(data), (e) => reject(e)));
    }
    /** Read file as bytes
         * @param {FileInfo | string} file
         * @returns {Promise<Uint8Array>} */
    readAsBytes(file) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_ReadAsBytes(file, (data) => resolve(wrappers_1.toJs(data)), (e) => reject(e)));
    }
    /** Write file
         * @param {FileInfo | string} file
         * @param {Array<number>} blob
         * @returns {Promise} */
    write(file, blob) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_Write(file, blob, () => resolve(), (e) => reject(e)));
    }
    /** Write file
         * @param {FileInfo | string} file
         * @param {string} data
         * @returns {Promise} */
    writeAsText(file, data) {
      return new Promise((resolve, reject) => api.grok_Dapi_UserFiles_WriteAsText(file, data, () => resolve(), (e) => reject(e)));
    }
  }
  exports.Files = Files;
  class Logger {
    constructor(putCallback) {
      this.putCallback = putCallback;
    }
    /** Saves audit record to Datagrok back-end
         * @param {string} message
         * @param {object} params
         * @param {string} type = 'log'
         * */
    log(message, params, type) {
      if (type == null)
        type = 'log';
      let msg = { message: message, params: params, type: type };
      if (this.putCallback != null)
        this.putCallback(msg);
      api.grok_Audit(msg.type, msg.message, wrappers_1.toDart(msg.params));
    }
  }
  exports.Logger = Logger;
});
