// TODO: termianr de refactorizar la partede la noticia
// TODO: limpar lo q no se utiliza despues de refactorizar

$.manager = {
    loaded: {},
    load: function (url, callback) {
        if (url in $.manager.loaded)
            return callback(Object.assign({}, $.manager.loaded[url]), false);
        cache = false;
        /*if(url.search('file for cache')!==-1){
            cache=true;
        }*/
        $.ajax({
            url: url,
            dataType: 'json',
            cache: cache,
            success: function (data) {
                $.manager.loaded[url] = Object.assign({}, data);
                callback(data, true);
            }
          });
    },
    news: {
        url: 'past_news.json',
        keysmap: {},
        keys: null,
        loaded: false,
        _wrapper: function(callback){
            // wrap callback to precompute index of each key one time only
            let f = function(data, cached){
                let keys = Object.keys(data).sort().reverse();
                $.manager.news.keys = keys;
                $.each(keys, (index,e)=> $.manager.news.keysmap[e]=index);
                $.manager.news.loaded = true;
                return callback(data);
            }
            return f;
        },
        load: function (callback) {
            $.manager.load($.manager.news.url, $.manager.news._wrapper(callback));
            //$.manager.load($.manager.news.url, callback);
        },
        data: function() {
            return $.manager.loaded[$.manager.news.url];
        },
        _get_new: function(key, with_paragraph = true, with_indexs = true){
            let news = $.manager.loaded[$.manager.news.url];
            let res = {
                date: key,
                title: news[key].title,
                author: news[key].author,
                abstract: news[key].summary,
            }
            if(with_paragraph===true){
                res['paragraphs'] = news[key].paragraphs;
            }
            if(with_indexs===true){
                indexs = $.manager.news._get_prev_next(key);
                Object.assign(res, {index: indexs});
            }
            return res;
        },
        _get_prev_next: function(key){
            let next = null;
            let nindex = $.manager.news.keysmap[key];
            nindex -= 1;
            if(nindex>=0){
                next = $.manager.news.keys[nindex];
            }
            let prev = null
            let pindex = $.manager.news.keysmap[key];
            pindex += 1;
            if(pindex<$.manager.news.keys.length){
                prev = $.manager.news.keys[pindex];
            }
            let indexs = {
                prev: prev,
                next: next,
                current: key,
            }
            return indexs;
        },
        build_card: function(key){
            let data = $.manager.news._get_new(key, false, false);

            let grid = $("<div></div>");
            grid.attr('class', 'col mb-2');

            let card = $("<div></div>");
            card.attr('class', 'card h-100');

            let body = $("<div></div>");
            body.attr('class', 'card-body');

            let date = $("<p></p>").text(key);
            date.attr('class', 'text-muted text-sm-center');
            body.append(date)

            let head = $("<h4></h4>").text(data.title);
            //head.attr('class', 'text');
            body.append(head);

            let abstract = $("<p></p>").text(data.abstract);
            body.append(abstract);

            card.append(body);

            let more = $("<a></a>").text("Más >>> ");
            more.attr('class', 'text-right');
            more.attr('style', 'white-space: pre;');
            more.attr("href", '#'+key);
           /* more.click(function(){
                //$("#current-new").text($(this).attr("id"))
                //return get_new($(this).attr("id"), news);
                // TODO: cambiar esto, parche temporal hasta refactorizar las noticias
                get_new(key,$.manager.news.data());
            });*/
            card.append(more);

            grid.append(card)
            return grid;
        },
        build_article: function(key){
            $("#principal-page").hide();
            $("#new").show();
            $("p").remove("#paragraph-new");
            keys = Object.keys(news).reverse();
            index = keys.indexOf(idd);
            date = keys[index];
            title = news[date]['title'];
            author = news[date]['author'];
            abstract = news[date]['summary'];
            paragraphs = news[date]['paragraphs'];
            $("#title-new").text(title);
            $("#author-new").text(author);
            $("#date-new").text(date);
            $("#yesterday-new").hide();
            $('#tomorrow-new').hide();
            if (index - 1 >= 0){
                date_1 = keys[index - 1];
                console.log("date_1, " + date_1);
                title = news[date_1]['title'];
                $("#tomorrow-new").show().text(title + " >>>").attr("href", "#").attr("class", date_1);
                $("#tomorrow-new").click(function(){
                    $("#current-new").text($(this).attr("id"))
                    return get_new(date_1, news);
                });
            }
            if (index + 1 < keys["length"]){
                date_2 = keys[index + 1];
                console.log("date_2, " + date_2);
                title = news[date_2]['title'];
                $("#yesterday-new").show().text("<<< " + title).attr("href", "#").attr("class", date_2);
                $("#yesterday-new").click(function(){
                    $("#current-new").text($(this).attr("id"))
                    return get_new(date_2, news);
                });
            }

            for (i in paragraphs){
                var p = $("<p></p>").text(paragraphs[i]).attr("id", "paragraph-new");
                $("#text-new").append(p);
            }
        }
    },
    router: {
        routes: {
            default: function(url){
                if(url in $.manager.news.keysmap){
                    return {
                        routeid: url,
                        controller: get_new,
                        el: $("#current-new"),
                    }
                }
                return null;
            },
            '/': {
                routeid: '/',
                controller: render_home,
                el: $("#principal-page"),
            }
        },
        elements: [$("#current-new"),$("#principal-page")],
        current_route: '/',
        router: function  () {
            if($.manager.news.loaded===false){
                $.manager.news.load( function(news){
                    $.manager.router.router();
                });
                return;
            }
            // Current route url (getting rid of '#' in hash as well):
            let url = location.hash.slice(1) || '/';
            // Get route by url:
            let route = null;
            if(url in $.manager.router.routes){
                route = $.manager.router.routes[url];
            }else{
                route = $.manager.router.routes.default(url);
            }
            // TODO: implement not found
            /* control of not found route 404
            if(route===null){
                //do somenthing
            }*/
            $.manager.router.current_route = url;
            let el = null;
            if (route.controller && route.el) {
                el = route.el;
                route.controller(el);
            }
            for(var i in $.manager.router.elements){
                $.manager.router.elements[i].hide();
            }
            el.show();
        },
    },
};

var one_time_rende_home = true;
var home_is_rendered = false;

function render_home(el){
    if(one_time_rende_home===true && home_is_rendered===true)return;
    let carddeck = $("<div></div>");
    carddeck.attr('class', 'row row-cols-1 row-cols-md-2 row-cols-lg-3');
    keys = $.manager.news.keys;
    let c = null;
    for (var d in keys){
        date = keys[d]
        c = $.manager.news.build_card(date);
        carddeck.append(c);
    }
    nl = el.find("#news-list");
    nl.append(carddeck);
    if(home_is_rendered===false)home_is_rendered=true;
}

/*$(document).ready(function(){
    $("#principal-page").show()
    $("#new").hide()*/
/*$.manager.news.load( function(news){
    let carddeck = $("<div></div>");
    carddeck.attr('class', 'row row-cols-1 row-cols-md-2 row-cols-lg-3');
    keys = $.manager.news.keys;
    //console.log($.manager.news.keys);
    //console.log($.manager.news.keysmap);
    for(var t in $.manager.router.elements){
        console.log(t);
    }
    let c = null;
    for (var d in keys){
        date = keys[d]
        //console.log($.manager.news._get_prev_next(date));
        title = news[date]['title'];
        author = news[date]['author'];
        abstract = news[date]['summary'];
        var c = $("<div></div>");
        c.attr('id', date);
        c.attr('class', 'col-sm-4');
        var t = $("<h4></h4>").text(title);
        var a = $("<p></p>").text(abstract);
        var dt = $("<p></p>").text(date)
        var id = "#" + date;
        var more = $("<a></a>").text("Más >>>");
        more.attr("href", '#');
        more.attr("id", date)
        more.click(function(){
            $("#current-new").text($(this).attr("id"))
            return get_new($(this).attr("id"), news);
        });
        c.append(t, dt, a, more);
        c = $.manager.news.build_card(date);
        carddeck.append(c)
    }
    $("#news-list").append(carddeck);
});*/
//});

function get_new(el){
    //$("#principal-page").hide();
    //$("#new").show();
    idd = $.manager.router.current_route;
    data = $.manager.news._get_new(idd);
    $("p").remove("#paragraph-new");
    news = $.manager.news.data();
    keys = Object.keys(news).reverse();
    index = keys.indexOf(idd);
    date = data.date;
    title = data.title;
    author = data.author;
    abstract = data.summary;
    paragraphs = data.paragraphs;
    $("#title-new").text(title);
    $("#author-new").text(author);
    $("#date-new").text(date);
    $("#yesterday-new").hide();
    $('#tomorrow-new').hide();
    /*if (index - 1 >= 0){
        date_1 = keys[index - 1];
        console.log("date_1, " + date_1);
        title = news[date_1]['title'];
        $("#tomorrow-new").show().text(title + " >>>").attr("href", "#").attr("class", date_1);
        $("#tomorrow-new").click(function(){
            $("#current-new").text($(this).attr("id"))
            return get_new(date_1, news);
        });
    }
    if (index + 1 < keys["length"]){
        date_2 = keys[index + 1];
        console.log("date_2, " + date_2);
        title = news[date_2]['title'];
        $("#yesterday-new").show().text("<<< " + title).attr("href", "#").attr("class", date_2);
        $("#yesterday-new").click(function(){
            $("#current-new").text($(this).attr("id"))
            return get_new(date_2, news);
        });
    }*/

    for (i in paragraphs){
        var p = $("<p></p>").text(paragraphs[i]).attr("id", "paragraph-new");
        $("#text-new").append(p);
    }
};

window.addEventListener('hashchange', $.manager.router.router);
// Listen on page load:
window.addEventListener('load', $.manager.router.router);