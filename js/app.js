$(function() {
    let app = function() {
        let x, p;
        let px, pp, p_percent;
        let globalAudioPaused = true;
        let audio = $('.audio')[0];
        let sample = $('.aboutme_sample')[0];
        let global_data = {};
        let lyricContent = '';
        let songList = [];
        let playing_id = 0;
        let winW = $(window).width();
        let bufferId = -1;
        let picChangable = true;
        let currentLyricIndex = 1;
        let sampleId = -1;
        this.wave_data = false;
        this.wave_steps = 0;
        this.active_step = 0;
        this.init = function() {
            let _this = this;
            $(window).on('keyup',this.keyEvents);
            $('.player').on('mousedown touchstart', this.start);
            $('.player').on('mousemove touchmove', this.move);
            $('.player').on('mouseup touchend', {
                this: this
            }, this.end);
            $('.all_pics_show').on('mousedown touchstart', this.picStart);
            $('.all_pics_show').on('mousemove touchmove', this.picMove);
            $('.all_pics_show').on('mouseup touchend', {
                this: this
            }, this.picEnd);
            $(window).off('resize').on('resize', this.resize);
            this.resize();
            $('.global_play_btn').off().on('click', {
                this: this
            }, this.play);
            $('.dismiss_queue').off().on('click', this.dismissQueue);
            $('.queue_btn').off().on('click', this.showQueue);
            $('.control .next').off().on('click', this.nextSong);
            $('.control .prev').off().on('click', this.prevSong);
            $(document).on('click', '.worklist li', this.showAlbumDetail);
            $(document).on('click', '.album_detail .close', this.hideAlbumDetail);
            $(document).on('click', '.queue_list_ul li', this.setNowPlaying);
            $(document).on('click', '.detail_play_btn', this.setNowPlaying);
            $('.nav_menu').off().on('click', this.showNav);
            $('.nav_dismiss ._btn').off().on('click', this.hideNav);
            $('.sample').off().on('click', {
                this: this
            }, this.playSample);
            $('.all_pics_show ._wrap .close').off().on('click', this.hidePicList);
            $('.pic_album.able').off().on('click', this.renderPicList);
            audio.volume = 0;
            audio.onended = function() {
                $('body').removeClass('playing');
                $('.text_process .now_time').text('0:00');
                $('.process_bar').css({
                    'width': '0%'
                });
                $('.lyric ul li').removeClass('on ready');
                $('.lyric ul li:first-child').addClass('ready');
                $('title').html('Jacky.Q');
                _this.nextSong();
            }
            bufferId = setInterval(function() {
                _this.updateBuffered();
            }, 200)
            audio.onwaiting = function() {
                $('body').addClass('loadstart')
            }
            audio.onpause = function() {
                $('body').removeClass('playing');
                globalAudioPaused = true;
                $('title').html('Paused - ' + global_data.name);
            }
            audio.onplay = function() {
                $('body').addClass('playing');
                globalAudioPaused = false;
                $('title').html(global_data.name);
            }
            audio.ontimeupdate = function() {
                _this.updateTime();
                $('body').removeClass('loadstart')
            }
            _this.renderNew();
            sample.onplay = function() {
                window.clearTimeout(sampleId)
                sampleId = setTimeout(function() {
                    _this.updateSampleTime()
                }, 50)
            }
            sample.onended = function() {
                $('.sample.on .sample_point').css({ 'left': -1 + 'px' });
                $('.sample').removeClass('on');
            }
        }
        this.updateSampleTime = function() {
            let _this = app;
            sample_p = sample.currentTime / sample.duration * $('.sample.on').outerWidth();
            $('.sample.on .sample_point').css({ 'left': sample_p + 'px' });
            if (!sample.paused) {
                window.clearTimeout(sampleId)
                sampleId = setTimeout(function() {
                    _this.updateSampleTime()
                }, 50)
            }
        }
        this.showNav = function() {
            $('body').addClass('show_nav');
        }
        this.hideNav = function() {
            $('body').removeClass('show_nav');
        }
        this.renderPicList = function() {
            $('body').addClass('pics_show');
            let pics = $(this).find('.all_pics').html();
            let picCount = $(this).find('.all_pics img').length;
            $('.all_pics_show .pic_list ul').html(pics);
            $('.all_pics_show .pic_list ul li:first-child').addClass('on');
            $('.all_pics_show .pic_list ul li:nth-child(2)').addClass('next');
            $('.now_pic .all').text(picCount);
            $('.now_pic .now').text('1');
        }
        this.hidePicList = function() {
            $('body').removeClass('pics_show');
        }
        this.showNextPic = function() {
            let nowPic = $('.pic_list ul li.on');
            if (nowPic.next().length && picChangable) {
                nowPic.removeClass('on').addClass('prev');
                nowPic.next().addClass('on').removeClass('next');
                nowPic.next().next().addClass('next');
                nowPic.prev().removeClass('prev');
                let nowIndex = parseInt($('.now_pic .now').html());
                $('.now_pic .now').html(nowIndex + 1);
            }
            picChangable = false;
            setTimeout(function() {
                picChangable = true;
            }, 300)
        }
        this.showPrevPic = function() {
            let nowPic = $('.pic_list li.on');
            if (nowPic.prev().length && picChangable) {
                nowPic.removeClass('on').addClass('next');
                nowPic.prev().addClass('on').removeClass('prev');
                nowPic.prev().prev().addClass('prev');
                nowPic.next().removeClass('next');
                let nowIndex = parseInt($('.now_pic .now').html());
                $('.now_pic .now').html(nowIndex - 1);
            }
            picChangable = false;
            setTimeout(function() {
                picChangable = true;
            }, 300)
        }
        this.playSample = function(e) {
            if (!globalAudioPaused) {
                app.play(e);
            }
            if ($(this).hasClass('on')) {
                sample.pause()
                $(this).removeClass('on');
                return false;
            }
            $('.sample').removeClass('on');
            $('.sample .sample_point').css({ 'left': -1 + 'px' });
            $(this).addClass('on');
            let sample_src = $(this).attr('data-src');
            sample.src = sample_src;
            sample.play()
        }
        this.hideAlbumDetail = function() {
            $('body').removeClass('show_detail');
        }
        this.showAlbumDetail = function() {
            let id = $(this).attr('data-id');
            let pos = app.getSongPosition(id);
            let song_data = songList[pos];
            let description = '';
            if (song_data.album_description) {
                description = '<p>\
                    Description: ' + song_data.album_description + '\
                </p>';
            }
            let genre = '';
            if (song_data.genre) {
                for (let i = song_data.genre.length - 1; i >= 0; i--) {
                    genre += '<span class="hashtag">' + song_data.genre[i] + '</span> ';
                }
            }
            let sameSong = '';
            if (playing_id == id && globalAudioPaused) {
                sameSong = ' on';
            }
            let intro = '<p class="title">' + song_data.name + '</p>\
                <p>\
                    Released on: ' + song_data.release_date + '\
                </p>\
                <p>\
                    Genre: ' + genre + '\
                </p>\
                <p>\
                    BPM: ' + song_data.bpm + '\
                </p>\
                ' + description + '\
                <p>\
                    <span class="detail_play_btn' + sameSong + '" data-id="' + song_data.id + '"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10.8 15.9l4.67-3.5c.27-.2.27-.6 0-.8L10.8 8.1c-.33-.25-.8-.01-.8.4v7c0 .41.47.65.8.4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg> Play This Song</span>\
                </p>';
            $('.album_detail_wrap .introduction').html(intro);
            $('.album_detail_wrap .detail_artwork img').attr({ 'src': song_data.artwork })
            $('body').addClass('show_detail');
        }
        this.getSongPosition = function(id) {
            id = parseInt(id)
            let idList = [];
            for (let i = 0; i < songList.length; i++) {
                idList.push(songList[i].id);
            }
            return idList.indexOf(id);
        }
        this.updateBuffered = function() {
            let bl = audio.buffered.length;
            if (bl == 0) {
                return false;
            }
            let ae = 0;
            try {
                ae = audio.buffered.end(0);
            } catch (e) {
                console.log(e);
            }
            if (bl == 1 && Math.abs(ae - global_data.duration) < 0.1) {
                $('.player .buffered').remove();
                return false;
            }
            $('.player .buffered').remove();
            try {
                for (let i = bl - 1; i >= 0; i--) {
                    let left = audio.buffered.start(i) / global_data.duration * 100;
                    let width = (audio.buffered.end(i) - audio.buffered.start(i)) / global_data.duration * 100;
                    $('.player').append('<div class="buffered" style="left:' + left + '%;width:' + width + '%;"></div>');
                }
            } catch (e) {
                console.log(e);
            }
        }
        this.initRoute = function() {
            // init route
            let changeRoute = function(where) {
                $('body').removeClass('show_nav');
                $('.nav a').removeClass('active');
                $('.page').removeClass('active');
                $('.page_loading').addClass('done');
                switch (where) {
                    case '/':
                        $('.nav a[href="#/"]').addClass('active');
                        $('.page[data-page="/"]').addClass('active');
                        break;
                    case 'mywork':
                        $('.nav a[href="#/mywork"]').addClass('active');
                        $('.page[data-page="/mywork"]').addClass('active');
                        if ($('body').hasClass('worklist_rendered')) {
                            break;
                        }
                        app.renderWorkList();
                        break;
                    case 'about':
                        $('.nav a[href="#/about"]').addClass('active');
                        $('.page[data-page="/about"]').addClass('active');
                        break;
                    case 'friends':
                        $('.nav a[href="#/friends"]').addClass('active');
                        $('.page[data-page="/friends"]').addClass('active');
                        break;
                    default:
                        break;
                }
            }
            let home = function() {
                changeRoute('/');
            }
            let mywork = function() {
                changeRoute('mywork');
            }
            let about = function() {
                changeRoute('about');
            }
            let friends = function() {
                changeRoute('friends');
            }
            let routes = {
                '/': home,
                '/mywork': mywork,
                '/about': about,
                '/friends': friends
            }

            let router = Router(routes);
            router.init('/');
        }
        this.setNowPlaying = function() {
            $('body').removeClass('show_queue');
            $('body').removeClass('show_detail');
            if ($(this).hasClass('on')) {
                if (!globalAudioPaused) {
                    return false;
                }
            }
            let idList = [];
            for (let i = 0; i < songList.length; i++) {
                idList.push(songList[i].id);
            }
            let this_id = parseInt($(this).attr('data-id'));
            let position = idList.indexOf(this_id);
            setTimeout(function() {
                app.renderNowPlaying(songList[position]);
                let return_this = {};
                return_this.data = app;
                globalAudioPaused = false;
                app.play(return_this);
            }, 350)
        }
        this.renderNowPlaying = function(data) {
            app.wave_data = false;
            playing_id = data.id;
            $('.worklist li').removeClass('on');
            $('.queue_list_ul li').removeClass('on');
            $('.player .buffered').remove();
            $('li[data-id="' + playing_id + '"]').addClass('on');
            $('.section_album img.bg').attr({
                'src': data.artwork
            });
            // $('.player .album img').attr({
            //     'src': data.artwork
            // })
            $('.js-front-album').attr({
                'src': data.artwork,
                'alt': data.name,
                'title': data.name
            });
            $('.platform_list').html('');
            $('.listen_on').show();
            if (data.other_platform.length != 0) {
                for (let i = data.other_platform.length - 1; i >= 0; i--) {
                    $('.platform_list').append('<li><a href="' + data.other_platform[i].href + '" target="_blank"><img src="img/' + data.other_platform[i].name + '.png" alt="' + data.other_platform[i].name + '" class="platform_icon"> ' + data.other_platform[i].name + '</a> </li>');
                }
            } else {
                $('.listen_on').hide();
            }
            global_data = data;
            let dur = data.duration;
            let min = Math.floor(dur / 60);
            let sec = dur % 60;
            sec = Math.ceil(sec);
            if (sec < 10) {
                sec = '0' + sec;
            }
            let durStr = min + ':' + sec;
            audio.src = data.src;
            $('.text_process .all_time').text(durStr);
            $('.player .wave').remove();
            $('.player').append('<div class="wave"></div>');
            if (global_data.wave_data) {
                app.renderWave(global_data.wave_data);
            }
            app.renderLyric(data.lyric);
            currentLyricIndex = 1;
            app.updateTime();
        }
        this.renderWave = function(src) {
            $('.player .wave').html('');
            let doIt = function(res) {
                // set bar width in px
                let barWidth = 4;
                let splitPoint = Math.floor($('body').width() / barWidth);
                app.wave_steps = splitPoint;
                let _x = parseInt(res.c0.length / splitPoint);
                for (let i = 1; i <= splitPoint; i++) {
                    let r = _x * i;
                    let sum0 = 0;
                    let avg0 = 0;
                    for (let j = 0; j < _x; j++) {
                        sum0 += Math.abs(res.c0[r - j]);
                    }
                    avg0 = sum0 / _x;
                    let sum1 = 0;
                    let avg1 = 0;
                    for (let j = 0; j < _x; j++) {
                        sum1 += Math.abs(res.c1[r - j]);
                    }
                    avg1 = sum1 / _x;
                    let h1;
                    let h2;
                    let h3;
                    if (isNaN(avg0) || isNaN(avg1)) {
                        break;
                    }
                    h1 = Math.abs(avg0) * 80;
                    h2 = Math.abs(avg1) * 80;
                    h3 = parseInt(h1 + h2);
                    $('.player .wave').append('<div class="vs ani_h" style="height:' + h3 + '%;animation-delay:' + i * 2 + 'ms"></div>');
                }
            }
            if (app.wave_data) {
                doIt(app.wave_data);
            } else {
                $.ajax({
                    url: src,
                    dataType: 'json',
                    success: function(res) {
                        doIt(res);
                    },
                    error: function() {
                        console.log('failed to get wave data')
                    }
                })
            }
        }
        this.renderList = function() {
            for (let i = 0; i < songList.length; i++) {
                let classOn = '';
                if (i == 0) {
                    classOn = 'on'
                }
                $('.queue_list_ul').append('<li data-id="' + songList[i].id + '" class="' + classOn + '">\
                    <div class="artwork">\
                        <img src="' + songList[i].artwork_s + '" alt="' + songList[i].name + '">\
                        <svg class="playing_this" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff">\
                        <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" /></svg>\
                    </div>\
                    <div class="name">\
                        ' + songList[i].name + '\
                    </div>\
                </li>')
            }
        }
        this.renderWorkList = function() {
            for (let i = 0; i < songList.length; i++) {
                let classOn = '';
                if (i == 0) {
                    classOn = 'on'
                }
                let genre = songList[i].genre;
                let tags = '';
                for (let j = 0; j < genre.length; j++) {
                    tags += '<span class="hashtag">' + genre[j] + '</span> '
                }
                $('.worklist').append('<li class="' + classOn + '" data-id="' + songList[i].id + '">\
                    <div class="cover_block">\
                        <div class="cover_wrap">\
                            <img src="' + songList[i].artwork + '" alt="songList[i].name">\
                            <div class="current_playing">\
                                <div class="fragment"></div>\
                                <div class="fragment"></div>\
                                <div class="fragment"></div>\
                                <div class="fragment"></div>\
                                <div class="fragment"></div>\
                            </div>\
                        </div>\
                        <div class="workname">\
                            <div class="song_title">' + songList[i].name + '</div>\
                            Released on: ' + songList[i].release_date + '<br>\
                            ' + tags + '\
                        </div>\
                    </div>\
                </li>');
            }
            $('body').addClass('worklist_rendered')
        }
        this.renderLyric = function(lyric) {
            $('.lyric ul').html('');
            $('.lyric .noLyric').removeClass('on');
            $.ajax({
                url: lyric,
                type: 'get',
                dataType: 'json',
                success: function(res) {
                    lyricContent = res;
                    let keys = Object.keys(res);
                    keys = keys.reverse();
                    for (let i = keys.length - 1; i >= 0; i--) {
                        $('.lyric ul').append('<li data-time="' + keys[i] + '">' + res[keys[i]] + '</li>');
                    }
                    $('.lyric ul li:nth-child(1)').addClass('ready');
                },
                error: function(e) {
                    console.log(e);
                    $('.lyric .noLyric').addClass('on').html('Loading error!');
                }
            })
        }
        this.renderNew = function(InData) {
            $('.now_playing span').html('Brand New Single');
            let _this = this;
            $.ajax({
                url: 'src/data.json',
                type: 'get',
                dataType: 'json',
                success: function(res) {
                    songList = res;
                    let data = InData || songList[0];
                    _this.renderNowPlaying(data);
                    _this.initRoute();
                    let s1 = setTimeout(function() {
                        _this.renderList();
                    }, 1000)
                },
                error: function(e) {
                    console.log(e);
                    alert('Something went wrong')
                }
            });
        }
        this.updateTime = function() {
            let _this = app;
            if (!globalAudioPaused) {
                let t = audio.currentTime;
                let _p = t / global_data.duration * 100;
                app.active_step = parseInt(app.wave_steps * (_p / 100)) + 1;
                $('.wave .vs:nth-child(-n+' + app.active_step + ')').addClass('on');
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
                _this.updateLyric();
            }
        }
        this.updateLyric = function() {
            let keys = Object.keys(lyricContent);
            let nextLyricIndex = currentLyricIndex + 1;
            if (audio.currentTime < parseFloat(keys[1])) {
                $('.lyric ul li:nth-child(1)').addClass('on');
                $('.lyric ul li:nth-child(2)').addClass('ready');
            }
            if (audio.currentTime + 0.15 > parseFloat(keys[currentLyricIndex - 1])) {
                $('.lyric ul li').removeClass('on ready');
                $('.lyric ul li:nth-child(' + currentLyricIndex + ')').addClass('on');
                $('.lyric ul li:nth-child(' + nextLyricIndex + ')').addClass('ready');
                currentLyricIndex = currentLyricIndex + 1;
            }
        }
        this.resize = function() {
            winW = $(window).width();
            if (winW > 800) {
                $('body').removeClass('show_nav');
            }
        }
        this.start = function(e) {
            e.stopPropagation();
            $('.control').addClass('disabled');
            $('.process_bar').removeClass('t');
            p = $('.process_bar').width();
            $('.player').addClass('on');
            x = e.pageX || e.originalEvent.changedTouches[0].pageX;
        }
        this.move = function(e) {
            if ($(this).hasClass('on')) {
                globalAudioPaused = true;
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
        this.end = function(e) {
            $('.control').removeClass('disabled');
            $('.player').removeClass('on');
            if (!globalAudioPaused) {
                return false;
            }
            _this = e.data.this;
            e.stopPropagation();
            $('.process_bar').addClass('t');
            p = $('.process_bar').width();
            let percent = p / $('.player').outerWidth();
            $('.process_bar').css({ 'width': percent * 100 + '%' });
            let nowTime = global_data.duration * percent;
            if (isNaN(nowTime)) {
                return false;
            }
            audio.currentTime = nowTime;
            $('body').addClass('loadstart');
            if (nowTime < 2) {
                audio.currentTime = 0;
            }
            _this.updateLyric();
            if (!audio.paused) {
                globalAudioPaused = false;
            }
            let tempIndex = 0;
            let keys = Object.keys(lyricContent);
            for (let i = keys.length - 1; i >= 0; i--) {
                if (audio.currentTime + 0.15 >= parseFloat(keys[i])) {
                    tempIndex = i;
                    break;
                }
            }
            app.active_step = parseInt(app.wave_steps * percent) + 1;
            $('.wave .vs:nth-child(n+' + app.active_step + ')').removeClass('on');
            currentLyricIndex = tempIndex + 1;
        }
        this.picStart = function(e) {
            e.stopPropagation();
            $('.all_pics_show').addClass('on');
            px = e.pageX || e.originalEvent.changedTouches[0].pageX;
            pp = $('.all_pics_show').width();
            p_percent = 0;
        }
        this.picMove = function(e) {
            if ($('.all_pics_show').hasClass('on')) {
                let now_px = e.pageX || e.originalEvent.changedTouches[0].pageX;
                let abs_px = now_px - px;
                let percent = abs_px / pp;
                p_percent = percent;
                let trans_p = percent * 20;
                let trans_p_next = trans_p + 20;
                let trans_p_prev = trans_p - 20;
                $('.pic_list li.on').css({ 'transform': 'translateX(' + trans_p + '%)' });
                $('.pic_list li.next').css({ 'transform': 'translateX(' + trans_p_next + '%)' });
                $('.pic_list li.prev').css({ 'transform': 'translateX(' + trans_p_prev + '%)' });
            }
        }
        this.picEnd = function(e) {
            let _this = e.data.this;
            $('.all_pics_show').removeClass('on');
            if (p_percent < -0.05) {
                _this.showNextPic();
            }
            if (p_percent > 0.05) {
                _this.showPrevPic();
            }
            $('.pic_list li').css({ 'transform': 'translateX(0)' });
            $('.pic_list li.on').css({ 'transform': 'translateX(0)' });
            $('.pic_list li.next').css({ 'transform': 'translateX(20%)' });
            $('.pic_list li.prev').css({ 'transform': 'translateX(-20%)' });
        }
        this.play = function(e) {
            $('.sample.on .sample_point').css({ 'left': -1 + 'px' });
            $('.sample').removeClass('on');
            sample.pause();
            let _this = e.data.this;
            $('body').addClass('active');
            $('.now_playing span').html('Now Playing')
            audio.volume = 1;
            if (!globalAudioPaused) {
                audio.pause();
            } else {
                $('body').addClass('loadstart');
                audio.play();
                $('title').html(global_data.name);
            }
        }
        this.nextSong = function() {
            let thisItemsPostion = app.getSongPosition(playing_id);
            let nextPosition = thisItemsPostion + 1;
            if (nextPosition >= songList.length) {
                nextPosition = 0;
            }
            let nextSongData = songList[nextPosition];
            app.renderNowPlaying(nextSongData);
            let return_this = {};
            return_this.data = app;
            globalAudioPaused = true;
            app.play(return_this);
        }
        this.prevSong = function() {
            let thisItemsPostion = app.getSongPosition(playing_id);
            let prevPosition = thisItemsPostion - 1;
            if (prevPosition < 0) {
                prevPosition = songList.length - 1;
            }
            let prevSongData = songList[prevPosition];
            app.renderNowPlaying(prevSongData);
            let return_this = {};
            return_this.data = app;
            globalAudioPaused = true;
            app.play(return_this);
        }
        this.dismissQueue = function() {
            $('body').removeClass('show_queue');
        }
        this.showQueue = function() {
            $('body').addClass('show_queue');
        }
        this.keyEvents = function(e){
            let k = e.keyCode;
            switch (k) {
                case 37:
                    // left
                    if(globalAudioPaused){
                        break;
                    }
                    app.prevSong()
                    break;
                case 39:
                    // right
                    if(globalAudioPaused){
                        break;
                    }
                    app.nextSong()
                    break;
                default:
                    // statements_def
                    break;
            }
        }
    }
    app = new app();
    app.init();
});