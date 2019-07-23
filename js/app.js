$(function () {
    let app = function () {
        let x, p;
        let globalAudioPaused = true;
        let screeenFits = true;
        let audio = $('.audio')[0];
        let global_data = {};
        let nolyric = false;
        let lyricContent = '';
        let songList = [];
        let playing_id = 0;
        let winW = $(window).width();
        this.init = function () {
            let _this = this;
            $('.player').on('mousedown touchstart', this.start);
            $('.player').on('mousemove touchmove', this.move);
            $('.player').on('mouseup touchend', {
                this: this
            }, this.end);
            $(window).off('resize').on('resize', this.resize);
            this.resize();
            $('.global_play_btn').off().on('click', {
                this: this
            }, this.play);
            $('.dismiss_queue').off().on('click', this.dismissQueue);
            $('.queue_btn').off().on('click', this.showQueue);
            $('.control .next').off().on('click', this.nextSong);
            $('.control .prev').off().on('click', this.prevSong);
            $(document).on('click','.worklist li', this.setNowPlaying);
            $(document).on('click','.queue_list_ul li', this.setNowPlaying);
            audio.volume = 0;
            audio.onended = function () {
                $('body').removeClass('playing');
                $('.text_process .now_time').text('0:00');
                $('.process_bar').css({
                    'width': '0%'
                });
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                globalAudioPaused = true;
                $('.lyric ul li').removeClass('on ready');
                $('.lyric ul li:first-child').addClass('ready');
                $('title').html('Jacky.Q');
                app.nextSong();
            }
            audio.onpause = function () {
                $('body').removeClass('playing');
                globalAudioPaused = true;
                $('title').html('Paused - ' + global_data.name);
            }
            audio.onplay = function () {
                $('body').addClass('playing');
                globalAudioPaused = false;
                $('title').html(global_data.name);
            }
            _this.renderNew();
            // init route
            let changeRoute = function (where) {
                $('.nav a').removeClass('active');
                $('.page').removeClass('active');
                switch (where) {
                    case '/':
                        $('.nav a[href="#/"]').addClass('active');
                        $('.page[data-page="/"]').addClass('active');
                        break;
                    case 'mywork':
                        $('.nav a[href="#/mywork"]').addClass('active');
                        $('.page[data-page="/mywork"]').addClass('active');
                        break;
                    case 'aboutme':
                        $('.nav a[href="#/aboutme"]').addClass('active');
                        $('.page[data-page="/aboutme"]').addClass('active');
                        break;
                    default:
                        break;
                }
            }
            let home = function () {
                changeRoute('/');
            }
            let mywork = function () {
                changeRoute('mywork');
            }
            let aboutme = function () {
                changeRoute('aboutme');
            }
            let routes = {
                '/': home,
                '/mywork': mywork,
                '/aboutme': aboutme
            }

            let router = Router(routes);
            router.init('/');
        }
        this.setNowPlaying = function(){
            if($(this).hasClass('on')){
                return false;
            }
            let idList = [];
            for (let i = 0; i < songList.length; i++) {
                idList.push(songList[i].id);
            }
            let this_id = parseInt($(this).attr('data-id'));
            let position = idList.indexOf(this_id);
            app.renderNowPlaying(songList[position]);
            let return_this = {};
            return_this.data = app;
            globalAudioPaused = true;
            app.play(return_this);
        }
        this.renderNowPlaying = function(data){
            playing_id = data.id;
            $('.worklist li').removeClass('on');
            $('.queue_list_ul li').removeClass('on');
            $('li[data-id="'+playing_id+'"]').addClass('on');
            $('.section_album img.bg').attr({
                'src': data.artwork
            });
            $('.player .album img').attr({
                'src': data.artwork
            })
            $('.js-front-album').attr({
                'src': data.artwork,
                'alt': data.name,
                'title': data.name
            });
            $('.lyric ul').html('')
            $('.platform_list').html('');
            for (var i = data.other_platform.length - 1; i >= 0; i--) {
                $('.platform_list').append('<li><a href="' + data.other_platform[i].href + '" target="_blank"><img src="img/' + data.other_platform[i].name + '.png" alt="' + data.other_platform[i].name + '" class="platform_icon"> ' + data.other_platform[i].name + '</a> </li>');
            }
            global_data = data;
            let dur = data.duration;
            let min = Math.floor(dur / 60);
            let sec = dur % 60;
            sec = Math.ceil(sec);
            let durStr = min + ':' + sec;
            audio.src = data.src;
            $('.text_process .all_time').text(durStr);
            if (data.lyric == '') {
                nolyric = true;
                $('.lyric .noLyric').addClass('on');
            } else {
                nolyric = false;
                $('.lyric .noLyric').removeClass('on');
                app.renderLyric(data.lyric);
            }
            app.updateTime();
        }
        this.renderList = function () {
            for (let i = 0; i < songList.length; i++) {
                let classOn = '';
                if (i == 0) {
                    classOn = 'on'
                }
                $('.queue_list_ul').append('<li data-id="' + songList[i].id + '" class="' + classOn + '">\
                    <div class="artwork">\
                        <img src="' + songList[i].artwork + '" alt="' + songList[i].name + '">\
                        <svg class="playing_this" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff">\
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" /></svg>\
                    </div>\
                    <div class="name">\
                        ' + songList[i].name + '\
                    </div>\
                </li>')
                let genre = songList[i].genre;
                let tags = '';
                for (let j = 0; j < genre.length; j++) {
                    tags += '<span class="hashtag">' + genre[j] + '</span> '
                }
                $('.worklist').append('<li class="' + classOn + '" data-id="' + songList[i].id + '">\
                    <div class="current_playing">\
                        <div class="fragment"></div>\
                        <div class="fragment"></div>\
                        <div class="fragment"></div>\
                        <div class="fragment"></div>\
                        <div class="fragment"></div>\
                    </div>\
                    <div class="cover_block">\
                        <img src="' + songList[i].artwork + '" alt="songList[i].name">\
                        <div class="workname">\
                            <div class="song_title">' + songList[i].name + '</div>\
                            ' + tags + '\
                        </div>\
                    </div>\
                </li>');
            }
        }
        this.renderLyric = function (lyric) {
            $.ajax({
                url: lyric,
                type: 'get',
                dataType: 'json',
                success: function (res) {
                    lyricContent = res;
                    let keys = Object.keys(res);
                    keys = keys.reverse();
                    for (let i = keys.length - 1; i >= 0; i--) {
                        $('.lyric ul').append('<li data-time="' + keys[i] + '">' + res[keys[i]] + '</li>');
                    }
                    $('.lyric ul li:first-child').addClass('ready');
                },
                error: function (e) {
                    console.log(e);
                    $('.lyric ul').html('<li class="on">loading error!</li>');
                }
            })
        }
        this.renderNew = function () {
            $('.now_playing span').html('Brand New Single');
            let _this = this;
            $.ajax({
                url: 'src/data.json',
                type: 'get',
                dataType: 'json',
                success: function (res) {
                    res = JSON.parse(res);
                    songList = res;
                    let data = res[0];
                    _this.renderNowPlaying(data);
                    let playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(function () {
                            audio.pause();
                            audio.currentTime = 0;
                            audio.volume = 1;
                        }).catch(function (error) {
                            console.log(error)
                        });
                    }
                    _this.renderList();
                },
                error: function (e) {
                    console.log(e);
                    alert('Something went wrong')
                }
            });
        }
        this.updateTime = function () {
            let _this = this;
            let s = setTimeout(function () {
                if (!globalAudioPaused) {
                    let t = audio.currentTime;
                    let _p = t / global_data.duration * 100;
                    $('.process_bar').css({
                        'width': _p + '%'
                    });
                    let _min = Math.floor(audio.currentTime / 60);
                    let _sec = audio.currentTime % 60;
                    _sec = _sec.toFixed(0);
                    if (_sec < 10) _sec = '0' + _sec;
                    if (_sec > 59) {
                        _sec = '00';
                        _min++;
                    }
                    let _durStr = _min + ':' + _sec;
                    $('.text_process .now_time').text(_durStr);
                    if (audio.currentTime === 0) {
                        $('.text_process .now_time').text('0:00');
                    }
                    if (!nolyric && screeenFits) {
                        _this.updateLyric();
                    }
                }
                _this.updateTime();
            }, 150)
        }
        this.updateLyric = function () {
            let keys = Object.keys(lyricContent);
            let tempObj = '';
            for (let i = keys.length - 1; i >= 0; i--) {
                if (audio.currentTime + 0.2 >= parseFloat(keys[i])) {
                    tempObj = $('.lyric ul li[data-time="' + keys[i] + '"]');
                    tempObj.addClass('on').removeClass('ready');
                    try {
                        tempObj.next().addClass('ready');
                        tempObj.prev().removeClass('on ready');
                    } catch (e) {
                        console.log(e);
                    }
                    break;
                }
                if (audio.currentTime < parseFloat(keys[0])) {
                    $('.lyric ul li:first-child').addClass('ready');
                }
            }
        }
        this.resize = function () {
            winW = $(window).width();
            if (winW < 1000) {
                screeenFits = false;
            } else {
                screeenFits = true;
                $('.lyric ul li').removeClass('ready on');
            }
        }
        this.start = function (e) {
            e.stopPropagation();
            globalAudioPaused = true;
            $('.process_bar').removeClass('t');
            p = $('.process_bar').width();
            $('.player').addClass('on');
            x = e.pageX || e.originalEvent.changedTouches[0].pageX;
        }
        this.move = function (e) {
            if ($(this).hasClass('on')) {
                let nowX = e.pageX || e.originalEvent.changedTouches[0].pageX;
                let abs = nowX - x;
                let nowP = p + abs;
                if (nowP <= winW && nowP >= 0) $('.process_bar').css({
                    'width': nowP
                });
                let percent = nowP / winW;
                let _currentPosition = global_data.duration * percent;
                if (_currentPosition < 0) {
                    _currentPosition = 0;
                }
                if (_currentPosition > global_data.duration) {
                    _currentPosition = global_data.duration;
                }
                let _min = Math.floor(_currentPosition / 60);
                let _sec = _currentPosition % 60;
                _sec = _sec.toFixed(0);
                if (_sec < 10) _sec = '0' + _sec;
                if (_sec > 59) {
                    _sec = '00';
                    _min++;
                }
                let _durStr = _min + ':' + _sec;
                if (audio.currentTime === 0) {
                    $('.text_process .now_time').text('0:00');
                    return false;
                }
                $('.text_process .now_time').text(_durStr);
            }
        }
        this.end = function (e) {
            _this = e.data.this;
            e.stopPropagation();
            $('.process_bar').addClass('t');
            $('.player').removeClass('on');
            p = $('.process_bar').width();
            let percent = p / winW;
            let nowTime = global_data.duration * percent;
            if (isNaN(nowTime)) {
                return false;
            }
            audio.currentTime = nowTime;
            if (nowTime < 2) {
                audio.currentTime = 0;
            }
            $('.lyric ul li').removeClass('on ready');
            if (screeenFits) {
                _this.updateLyric();
            }
            if (!audio.paused) {
                globalAudioPaused = false;
            }
        }
        this.play = function (e) {
            let _this = e.data.this;
            $('body').addClass('active');
            $('.now_playing span').html('Now Playing')
            audio.volume = 1;
            if (!globalAudioPaused) {
                audio.pause();
            } else {
                audio.play();
                $('title').html(global_data.name);
            }
        }
        this.nextSong = function () {
            let idList = [];
            for (let i = 0; i < songList.length; i++) {
                idList.push(songList[i].id);
            }
            let thisItemsPostion = idList.indexOf(playing_id);
            let nextPosition = thisItemsPostion + 1;
            if(nextPosition >= idList.length){
                nextPosition = 0;
            }
            let nextSongData = songList[nextPosition];
            app.renderNowPlaying(nextSongData);
        }
        this.prevSong = function () {
            let idList = [];
            for (let i = 0; i < songList.length; i++) {
                idList.push(songList[i].id);
            }
            let thisItemsPostion = idList.indexOf(playing_id);
            let prevPosition = thisItemsPostion - 1;
            if(prevPosition < 0){
                prevPosition = idList.length - 1;
            }
            let prevSongData = songList[prevPosition];
            app.renderNowPlaying(prevSongData);
        }
        this.dismissQueue = function () {
            $('body').removeClass('show_queue');
        }
        this.showQueue = function () {
            $('body').addClass('show_queue');
        }
    }
    app = new app();
    app.init();
    // setTimeout(function () {
    //     alert('On Building...')
    // }, 1000)
});