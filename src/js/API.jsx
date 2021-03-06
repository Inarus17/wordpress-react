import ServerActions from './Actions/ServerActions.jsx';
import DataStore from './Stores/DataStore.jsx';

let API = {
    make_tree(items, idAttr, parentAttr, childrenAttr) {
        if (!idAttr) idAttr = 'ID';
        if (!parentAttr) parentAttr = 'menu_item_parent';
        if (!childrenAttr) childrenAttr = 'children';
        var tree = [],
            lookup = {};
        Array.prototype.forEach.call(items, obj => {
            lookup[obj[idAttr]] = obj;
            obj[childrenAttr] = [];
        });
        Array.prototype.forEach.call(items, obj => {
            if (obj[parentAttr] != '0') {
                lookup[obj[parentAttr]][childrenAttr].push(obj);
            } else {
                tree.push(obj);
            }
        });
        return tree;
    },
    camelize(str) {
        // returns "page-CustomPage1.php" as "PageCustomPage1"
        return str.replace(/\.[^/.]+$/, "").match(/[A-Z][a-z]+(?![a-z])|[A-Z]+(?![a-z])|([a-zA-Z\d]+(?=-))|[a-zA-Z\d]+(?=_)|[a-z]+(?=[A-Z])|[A-Za-z0-9]+/g).map(function(s) {
                return s[0].toUpperCase() + s.substring(1)
            }).join('');
    },
    timeConvert(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000),
            months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            monthsNum = ['1','2','3','4','5','6','7','8','9','10','11','12'],
            year = a.getFullYear(),
            month = monthsNum[a.getMonth()],
            date = a.getDate(),
            hour = a.getHours(),
            min = a.getMinutes(),
            sec = a.getSeconds(),
            time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec;
        return time;
    },
    getFromBetween: {
        // getFromBetween.get(string, 'start' ,'end');
        results: [],
        string: "",
        getFromBetween:function (sub1,sub2) {
            if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
            var SP = this.string.indexOf(sub1)+sub1.length,
                string1 = this.string.substr(0,SP),
                string2 = this.string.substr(SP),
                TP = string1.length + string2.indexOf(sub2);
            return this.string.substring(SP,TP);
        },
        removeFromBetween:function (sub1,sub2) {
            if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
            var removal = sub1+this.getFromBetween(sub1,sub2)+sub2;
            this.string = this.string.replace(removal,"");
        },
        getAllResults:function (sub1,sub2) {
            if(this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;
            var result = this.getFromBetween(sub1,sub2);
            this.results.push(result);
            this.removeFromBetween(sub1,sub2);
            if(this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
                this.getAllResults(sub1,sub2);
            }
            else return;
        },
        get:function (string,sub1,sub2) {
            this.results = [];
            this.string = string;
            this.getAllResults(sub1,sub2);
            return this.results;
        }
    },
    set_menu_tree(items) {
        console.log('1. In API > set_menu_tree start');
        let _ = this,
            menus = [],
            menuTrees = Object
                .keys(items)
                .map( (currentValue) => {
                    menus[currentValue] = _.make_tree(items[currentValue]);
                });

        ServerActions.setMenuTree(menus);

        console.log('5. In API > set_menu_tree complete.');
    },
    get_params(string) {
        var params = {};
        if (string) string.split("&").forEach(item => {let [k,v] = item.split("="); v = v && decodeURIComponent(v); (params[k] = params[k] || []).push(v)});
        return params;
    },
    getParameter(paramName) {
        var searchString = window.location.search.substring(1),
            i,
            val,
            params = searchString.split("&");
        for (i=0;i<params.length;i++) {
            val = params[i].split("=");
            if (val[0] == paramName) {
                return val[1];
            } else {
                return false;
            }
        }
        return null;
    },
    clone(obj) {
        var _ = this,
            copy;
        if (null == obj || "object" != typeof obj) return obj;
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = _.clone(obj[i]);
            }
            return copy;
        }
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                // if (obj.hasOwnProperty(attr)) copy[attr] = _.clone(obj[attr]);
                if (obj.hasOwnProperty(attr)) copy[attr] = _.clone(true);
            }
            return copy;
        }
        throw new Error("Unable to copy obj");
    },
    deepDiffMapper: {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function(obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                // return {
                //     type: this.compareValues(obj1, obj2),
                //     data: (obj1 === undefined) ? obj2 : obj1
                // };

                return obj1 === undefined ? obj2 : obj1;

            }

            var diff = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if ('undefined' != typeof(obj2[key])) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || ('undefined' != typeof(diff[key]))) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function(value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if ('undefined' == typeof(value1)) {
                return this.VALUE_CREATED;
            }
            if ('undefined' == typeof(value2)) {
                return this.VALUE_DELETED;
            }

            return this.VALUE_UPDATED;
        },
        isFunction: function(obj) {
            return {}.toString.apply(obj) === '[object Function]';
        },
        isArray: function(obj) {
            return {}.toString.apply(obj) === '[object Array]';
        },
        isDate: function(obj) {
            return {}.toString.apply(obj) === '[object Date]';
        },
        isObject: function(obj) {
            return {}.toString.apply(obj) === '[object Object]';
        },
        isValue: function(obj) {
            return !this.isObject(obj) && !this.isArray(obj);
        }
    },
    get_wp_vars() {
        ServerActions.getWpVars(window.app);
    },
    evalScripts(current_page){
        current_page = current_page ? current_page : false;

        if(current_page && current_page.wp_head){
            API.windowGarbageCollection();
            window.jQuery('head').html(current_page.wp_head);
        }
    },
    set_current_page_id(origin, pathname, id) {
        var _ = this,
            ds = DataStore;

        if(!id){
            if(_.getParameter('page_id')){
                ServerActions.setCurrentPageID(_.getParameter('page_id').toString());
            } else {

                var findItem = function(item) { 
                        return item.url === origin + pathname;
                    },
                    currItem = false,
                    menus = ds.getWpVars('menus'),
                    items = Object
                        .keys(menus)
                        .map( (currentValue) => {
                            if(menus[currentValue].find(findItem)){
                                currItem = menus[currentValue].find(findItem);
                                return;
                            }
                        });

                if(currItem != false){
                    ServerActions.setCurrentPageID(currItem.object_id);
                } else {
                    // if requested page not in menu
                    _.react_get_post_not_in_menu(ds.getWpVars('ajaxSubmitURL'), 'react_get_post_not_in_menu', document.location.pathname);
                }
            }
        } else {
            ServerActions.setCurrentPageID(id);
        }
    },
    transitionToCurrentPage(object_id, url){
        let _ = this,
            CurrentPageID = DataStore.getCurrentPageID(),
            { origin, pathname } = document.location;

        object_id = object_id ? object_id : 0;
        url = url ? url : origin + pathname;

        if( !_.getParameter('page_id') && CurrentPageID != object_id ){
            let { PATHINFO_BASENAME, siteurl } = DataStore.data.wp_vars.constants,
                toUrl = '/'+PATHINFO_BASENAME+url.replace(siteurl, '');
            if( pathname == toUrl ){
                _.set_current_page_id(origin, pathname, false);
                return;
            }
        }

        if( ( _.getParameter('page_id') && _.getParameter('page_id').toString() == object_id && CurrentPageID != object_id ) || 
            ( _.getParameter('page_id') && _.getParameter('page_id').toString() != object_id && CurrentPageID == object_id )
            ) {
            _.set_current_page_id(false, false, _.getParameter('page_id'));
            return;
        }
    },
    react_get_page(url, action, id, uri) {
        var _ = this,
            params = "action=" + action + '&page_id=' + id + '&uri=' + uri,
            req = new XMLHttpRequest(),
            parseReq = function(xhr) {
                var reqData;
                if (!xhr.responseType || xhr.responseType === "text") {
                    reqData = xhr.responseText;
                } else if (xhr.responseType === "document") {
                    reqData = xhr.responseXML;
                } else {
                    reqData = xhr.response;
                }
                return reqData;
            },
            callInt = function() {
                req.open('POST', url);
                req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                req.send(params);
            },
            reqListener = function() {
                console.log('AJAX_getPage complete: id = ' + id + ', uri = ' + uri);
                _.triggerPageLoad();
            };

        req.timeout = 9999999;
        req.addEventListener("load", reqListener);
        req.ontimeout = function() {
            console.log("Timed out");
        };
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                var data = parseReq(req),
                    parsed = JSON.parse(data),
                    html = parsed[parsed.last_page_id].html;

                parsed[parsed.last_page_id].js = [];

                while( html.indexOf('<script>') !== -1 && html.indexOf('<\/script>') !== -1 ){
                    parsed[parsed.last_page_id].js.push(_.getFromBetween.get(html, '<script>' ,'<\/script>'));
                    html = html.replace(/<script>[\s\S]*?<\/script>/, '');
                }

                parsed[parsed.last_page_id].html = html;
                ServerActions.setPageInCache(parsed);
            }
            if (req.readyState == 4 && req.status == 400) {
                console.log('error');
            }
        };
        callInt();
    },
    react_get_post_not_in_menu(url, action, uri) {
        var _ = this,
            params = "action=" + action + '&uri=' + uri,
            req = new XMLHttpRequest(),
            parseReq = function(xhr) {
                var reqData;
                if (!xhr.responseType || xhr.responseType === "text") {
                    reqData = xhr.responseText;
                } else if (xhr.responseType === "document") {
                    reqData = xhr.responseXML;
                } else {
                    reqData = xhr.response;
                }
                return reqData;
            },
            callInt = function() {
                req.open('POST', url);
                req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                req.send(params);
            },
            reqListener = function() {
                console.log('react_get_post_not_in_menu complete: uri = ' + uri);
            };

        req.timeout = 9999999;
        req.addEventListener("load", reqListener);
        req.ontimeout = function() {
            console.log("Timed out");
        };
        req.onreadystatechange = function() {
            if (req.readyState == 4 && req.status == 200) {
                var data = parseReq(req),
                    parsed = JSON.parse(data),
                    menus = DataStore.getWpVars('menus'),
                    menuTrees = Object
                        .keys(menus)
                        .map( (currentValue) => {
                            menus[currentValue].push(parsed);
                        });

                _.set_menu_tree(menus);
                ServerActions.setCurrentPageID(parsed.object_id);
            }
            if (req.readyState == 4 && req.status == 400) {
                console.log('error');
            }
        };
        callInt();
    },
    AJAX_getPage(id, uri){
        var _ = this,
            ds = DataStore;
        if (id != false ){
            if(ds.getCachedPage(id, true)){
                ds.setIsCachedPage(1);
                ServerActions.getPageFromCache(id);
            } else {
                ds.setIsCachedPage(0);
                if (uri != false ){
                    _.react_get_page(ds.getWpVars('ajaxSubmitURL'), 'react_get_page', false, uri);
                    return;
                } else {
                    // in case post_status is not 'publish', and item is not in menu
                    // eg. accessed from 'Preview' link, or with 'p' or 'page_id' params
                    _.react_get_page(ds.getWpVars('ajaxSubmitURL'), 'react_get_page', id, false);
                    return;
                }
            }
        }
    },
    stripSiteUrl(url, object_id){
        var getWpVars = DataStore.getWpVars(),
            {PATHINFO_BASENAME, siteurl, page_on_front} = getWpVars.constants,
            stripped = object_id.toString() != page_on_front ? '/'+PATHINFO_BASENAME+url.replace(siteurl, '') : '/'+PATHINFO_BASENAME+'/';
        return stripped;
    },
    windowGarbageCollection(){
        var removeObjects = Object
            .keys(window)
            .map( (currentValue) => {
                if(!window.window_cache[currentValue]){
                    if(currentValue != 'window_cache' && currentValue != '0'){
                        window[currentValue] = false;
                    }
                }
            });

    },
    triggerPageLoad(){
        var _ = this,
            jq = window.jQuery,
            react_page_js = [{}],
            appendScripts = null,
            mappedParams = null;

        jq('#react_page script').each(function(){
            react_page_js.push(this);
            jq('#react_page').find(this).remove();
        });

        appendScripts = Object
            .keys(react_page_js)
            .map( (currentValue, index) => {
                return react_page_js[index];
            })
            .map( (currentValue) => {
                if(typeof currentValue.outerHTML != 'undefined') {
                    jq('head').append(currentValue);
                }
            });

        jq(document).trigger('ready');
        jq(window).trigger('load');
        jq(window).trigger('resize');
    }
};

export default API;
