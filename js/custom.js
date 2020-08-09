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
        //keys: {},
        /*_wrapper: function(callback){
            // wrap callback to precompute index of each key one time only
            let f = function(data, cached){
                let keys = Object.keys(data).reverse();
                $.each(keys, (index,e)=> $.manager.news.keys[e]=index);
                //console.log($.manager.news.keys);
                return callback(data);
            }
            return f;
        },*/
        load: function (callback) {
            //$.manager.load($.manager.news.url, $.manager.news._wrapper(callback));
            $.manager.load($.manager.news.url, callback);
        },
        data: function name(params) {
            return $.manager.loaded[$.manager.news.url];
        },
        _get_new: function(key, with_paragraph = true){
            let news = $.manager.loaded[$.manager.news.url];
            let res = {
                date: keys,
                title: news[date]['title'],
                author: news[date]['author'],
                abstract: news[date]['summary'],
            }
            if(with_paragraph===true){
                res['paragraphs'] = news[date]['paragraphs'];
            }
            return res;
        },
        build_card: function(key){
            let data = $.manager.news._get_new(key, false);
            let grid = $("<div></div>");
            grid.attr('class', 'col mb-2');
            let card = $("<div></div>");
            card.attr('class', 'card text-center h-100');

            let head = $("<div></div>").text(data.title);
            head.attr('class', 'card-header');
            card.append(head);

            let body = $("<div></div>");
            body.attr('class', 'card-body');
            let abstract = $("<p></p>").text(data.abstract);
            body.append(abstract);
            card.append(body);

            let footer = $("<div></div>");
            footer.attr('class', 'card-footer');
            let ftext = $("<p></p>").text(key);
            ftext.attr('class', 'text-muted');
            ftext.attr('style', 'white-space: pre;');
            let more = $("<a></a>").text("              Más >>>");
            more.attr("href", '#');
            more.click(function(){
                //$("#current-new").text($(this).attr("id"))
                //return get_new($(this).attr("id"), news);
                // TODO: cambiar esto, parche temporal hasta refactorizar las noticias
                get_new(key,$.manager.news.data());
            });
            ftext.append(more);
            footer.append(ftext);
            card.append(footer)

            grid.append(card)
            return grid;
        },
    }
};

/*$(document).ready(function(){
    $("#principal-page").show()
    $("#new").hide()*/
$.manager.news.load( function(news){
    let carddeck = $("<div></div>");
    carddeck.attr('class', 'row row-cols-1 row-cols-md-2 row-cols-lg-3');
    keys = Object.keys(news).reverse();
    let c = null;
    for (var d in keys){
        date = keys[d]
        /*title = news[date]['title'];
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
        c.append(t, dt, a, more);*/
        c = $.manager.news.build_card(date);
        carddeck.append(c)
    }
    $("#news-list").append(carddeck);
});
//});

function get_new(idd, news){
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

};