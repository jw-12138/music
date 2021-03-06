$(function () {
    class app {
        constructor() {
            let tips_count = 0;
            let lan = 'en';
            let lan_pack = {};
            let language_set = {};
            let db = window.localStorage;
            let _this = this;
            let x;
            let p;
            let px;
            let pp;
            let p_percent;
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
            let sample_p = -1;
            let playCount = 0;
            let yearLoad = 0;
            this.load = function () {
                if (db.getItem('lan')) {
                    lan = db.getItem('lan');
                }
                if (lan == 'cn') {
                    $('.switch').addClass('en');
                } else {
                    $('.switch').addClass('cn');
                }
                $.ajax({
                    url: 'src/lan.json',
                    dataType: 'json',
                    success: function (res) {
                        language_set = res;
                        _this.renderLanguage(language_set[lan], function () {
                            _this.init();
                        });
                    },
                    error: function (e) {
                        alert('Failed to load language pack, refresh this page and try again?');
                    }
                });
            };
            this.init = function () {
                window.onbeforeunload = function (e) {
                    if (!globalAudioPaused) {
                        e.preventDefault();
                        e.returnValue = 'This action will stop the audio, are you sure to keep going?';
                    }
                };
                $('.togglePlayer').off().on('click', this.togglePlayer);
                $(window).on('keyup', this.keyEvents);
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
                $('.switch').off().on('click', this.changeLanguage);
                // $('.section_like').off().on('click', this.likeThisSong);
                audio.volume = 0;
                audio.onended = function () {
                    $('body').removeClass('playing');
                    $('.text_process .now_time').text('0:00');
                    $('.process_bar').css({
                        'width': '0%'
                    });
                    $('.lyric ul li').removeClass('on ready');
                    $('.lyric ul li:first-child').addClass('ready');
                    $('title').html('Jacky.Q');
                    _this.nextSong();
                };
                bufferId = setInterval(function () {
                    _this.updateBuffered();
                    _this.updateTime();
                }, 200);
                audio.onwaiting = function () {
                    $('body').addClass('loadstart');
                };
                audio.onpause = function () {
                    $('body').removeClass('playing');
                    globalAudioPaused = true;
                    $('title').html(`${lan_pack.paused} - ${global_data.name}`);
                    $('.wave.t').css({'animation-play-state':'paused'});
                };
                audio.onplay = function () {
                    $('body').addClass('playing');
                    globalAudioPaused = false;
                    $('title').html(global_data.name);
                };
                audio.ontimeupdate = function () {
                    $('body').removeClass('loadstart');
                };
                sample.onplay = function () {
                    window.clearTimeout(sampleId);
                    sampleId = setTimeout(function () {
                        _this.updateSampleTime();
                    }, 50);
                };
                sample.onended = function () {
                    $('.sample.on .sample_point').css({
                        'left': -1 + 'px'
                    });
                    $('.sample').removeClass('on');
                };
                _this.renderNew();
                // _this.getRealYear();
            };
            this.getRealYear = function() {
                $.ajax({
                    url: 'https://api.jacky97.top/year.php',
                    beforeSend: function() {
                        let interval = 0;
                        window.clearInterval(yearLoad);
                        yearLoad = setInterval(function() {
                            if (interval > 5) {
                                interval = 0;
                            }
                            if (interval == 0) {
                                $('.copy_right_year').text('#===');
                            }
                            if (interval == 1) {
                                $('.copy_right_year').text('=#==');
                            }
                            if (interval == 2) {
                                $('.copy_right_year').text('==#=');
                            }
                            if (interval == 3) {
                                $('.copy_right_year').text('===#');
                            }
                            if (interval == 4) {
                                $('.copy_right_year').text('==#=');
                            }
                            if (interval == 5) {
                                $('.copy_right_year').text('=#==');
                            }
                            interval++;
                        }, 100)
                    },
                    success: function(res) {
                        window.clearInterval(yearLoad);
                        $('.copy_right_year').text(res);
                    },
                    error: function(e) {
                        // _.getRealYear();
                    }
                })
            }
            this.changeLanguage = function () {
                if ($(this).hasClass('cn')) {
                    lan = 'cn';
                    $(this).removeClass(lan).addClass('en');
                } else {
                    lan = 'en';
                    $(this).removeClass(lan).addClass('cn');
                }
                db.setItem('lan', lan);
                _this.renderLanguage(language_set[lan]);
                _this.showTips(`${lan_pack.switch_success}`, 2500);
            };
            this.renderLanguage = function (data, call) {
                lan_pack = data;
                let l = $('span.lan').length;
                for (let i = 0; i < l; i++) {
                    let lanindex = $($('span.lan')[i]).attr('data-lanindex');
                    $($('span.lan')[i]).html(lan_pack[lanindex]);
                }
                if (call) {
                    call();
                }
            };
            this.togglePlayer = function () {
                if ($('body').hasClass('active')) {
                    $('body').removeClass('active');
                } else {
                    $('body').addClass('active');
                }
            };
            this.updateSampleTime = function () {
                sample_p = sample.currentTime / sample.duration * $('.sample.on').outerWidth();
                $('.sample.on .sample_point').css({
                    'left': sample_p + 'px'
                });
                if (!sample.paused) {
                    window.clearTimeout(sampleId);
                    sampleId = setTimeout(function () {
                        _this.updateSampleTime();
                    }, 50);
                }
            };
            this.showNav = function () {
                $('body').addClass('show_nav');
            };
            this.hideNav = function () {
                $('body').removeClass('show_nav');
            };
            this.renderPicList = function () {
                $('body').addClass('pics_show');
                let pics = $(this).find('.all_pics').html();
                let picCount = $(this).find('.all_pics img').length;
                $('.all_pics_show .pic_list ul').html(pics);
                $('.all_pics_show .pic_list ul li:first-child').addClass('on');
                $('.all_pics_show .pic_list ul li:nth-child(2)').addClass('next');
                $('.now_pic .all').text(picCount);
                $('.now_pic .now').text('1');
            };
            this.hidePicList = function () {
                $('body').removeClass('pics_show');
            };
            this.showNextPic = function () {
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
                setTimeout(function () {
                    picChangable = true;
                }, 300);
            };
            this.showPrevPic = function () {
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
                setTimeout(function () {
                    picChangable = true;
                }, 300);
            };
            this.playSample = function (e) {
                if (!globalAudioPaused) {
                    _this.play(e);
                }
                if ($(this).hasClass('on')) {
                    sample.pause();
                    $(this).removeClass('on');
                    return false;
                }
                $('.sample').removeClass('on');
                $('.sample .sample_point').css({
                    'left': -1 + 'px'
                });
                $(this).addClass('on');
                let sample_src = $(this).attr('data-src');
                sample.src = sample_src;
                sample.play();
            };
            this.hideAlbumDetail = function () {
                $('body').removeClass('show_detail');
                let st = setTimeout(function () {
                    $('.album_detail_wrap .detail_artwork img').attr({
                        'src': ''
                    });
                    $('.album_detail_wrap .introduction').html('');
                }, 300)
            };
            this.showAlbumDetail = function () {
                let id = $(this).attr('data-id');
                let pos = _this.getSongPosition(id);
                let song_data = songList[pos];
                $('.album_detail_wrap .detail_artwork img').attr({
                    'src': song_data.artwork
                });
                let description = '';
                if (song_data.album_description) {
                    description = `<p>${lan_pack.description}: ${song_data.album_description}</p>`;
                }
                let genre = '';
                if (song_data.genre) {
                    for (let i = song_data.genre.length - 1; i >= 0; i--) {
                        genre += `<span class="hashtag">${song_data.genre[i]}</span> `;
                    }
                }
                let sameSong = '';
                if (playing_id == id) {
                    sameSong = ' on';
                }
                let intro = `<p class="title">${song_data.name}</p>
                    <p>${lan_pack.released_on}: ${song_data.release_date}</p>
                    <p>${lan_pack.genre}: ${genre}</p>
                    <p>BPM: ${song_data.bpm}</p>
                    ${description}
                <p>
                <span class="detail_play_btn ${sameSong}" data-id="${song_data.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M10.8 15.9l4.67-3.5c.27-.2.27-.6 0-.8L10.8 8.1c-.33-.25-.8-.01-.8.4v7c0 .41.47.65.8.4zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg> ${lan_pack.play_this_song}</span>
                </p>`;
                $('.album_detail_wrap .introduction').html(intro);
                $('body').addClass('show_detail');
            };
            this.getSongPosition = function (id) {
                id = parseInt(id);
                let idList = [];
                for (let i = 0; i < songList.length; i++) {
                    idList.push(songList[i].id);
                }
                return idList.indexOf(id);
            };
            this.updateBuffered = function () {
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
                        $('.player').append(`<div class="buffered" style="left:${left}%;width:${width}%;"></div>`);
                    }
                } catch (e) {
                    console.log(e);
                }
            };
            this.initRoute = function () {
                // init route
                let changeRoute = function (where) {
                    _this.dismissQueue();
                    _this.hideNav();
                    _this.hideAlbumDetail();
                    _this.hidePicList();
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
                            _this.renderWorkList();
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
                };
                let home = function () {
                    changeRoute('/');
                };
                let mywork = function () {
                    changeRoute('mywork');
                };
                let about = function () {
                    changeRoute('about');
                };
                let friends = function () {
                    changeRoute('friends');
                };
                let routes = {
                    '/': home,
                    '/mywork': mywork,
                    '/about': about,
                    '/friends': friends
                };
                let router = Router(routes);
                router.init('/');
            };
            this.showTips = function (text, d) {
                let index = 'tips_' + tips_count;
                let st1 = setTimeout(function () {
                    $('.tips').append(`<div class="tp ${index}">${text}<div class="pss" style="animation-duration:${d}ms;"></div></div>`);
                    let st2 = setTimeout(function () {
                        $('.tips').find('.tp.' + index).addClass('r');
                        let st3 = setTimeout(function () {
                            $('.tips').find('.tp.' + index).remove();
                        }, 600);
                    }, d);
                }, 100);
                tips_count++;
            };
            this.setNowPlaying = function () {
                let obj = $(this);
                if (obj.hasClass('on')) {
                    if ($('body').hasClass('playing')) {
                        _this.showTips(`${lan_pack.playing_this_song}`, 2500);
                        return false;
                    }
                }
                $('body').removeClass('show_queue');
                $('body').removeClass('show_detail');
                let idList = [];
                for (let i = 0; i < songList.length; i++) {
                    idList.push(songList[i].id);
                }
                let this_id = parseInt(obj.attr('data-id'));
                let position = idList.indexOf(this_id);
                setTimeout(function () {
                    _this.renderNowPlaying(songList[position]);
                    let return_this = {
                        data: {
                            this: _this
                        }
                    };
                    globalAudioPaused = true;
                    _this.play(return_this);
                }, 300);
            };
            this.preloadNextAlbum = function (i) {
                if (i >= songList.length) {
                    i = 0;
                }
                if ($('.preload').length) {
                    $('.preload').attr({
                        src: songList[i].artwork
                    });
                } else {
                    $('body').append(`<img class="preload" src="${songList[i].artwork}"/>`);
                }
            };
            this.likeThisSong = function () {
                let obj = $(this);
                if (obj.hasClass('on')) {
                    return false;
                }
                if (!playing_id || playing_id == 0) {
                    return false;
                }
                $.ajax({
                    url: 'https://api.jacky97.top/',
                    data: {
                        playing_id: playing_id,
                        action: 'like'
                    },
                    dataType: 'json',
                    beforeSend: function () {
                        obj.addClass('on');
                    },
                    success: function (res) {
                        obj.removeClass('on');
                        if (res.success) {
                            $('.section_like span.num').text(res.like_count);
                        } else {
                            console.log('500');
                        }
                    },
                    error: function (e) {
                        console.log(e);
                        obj.removeClass('on');
                    }
                });
            };
            this.getLike = function (id) {
                $('.section_like span.num').text('-');
                $.ajax({
                    url: 'https://api.jacky97.top/',
                    data: {
                        playing_id: id,
                        action: 'get_like'
                    },
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            $('.section_like span.num').text(res.like_count);
                        } else {
                            console.log('500');
                        }
                    },
                    error: function (e) {
                        console.log(e);
                    }
                });
            };
            this.renderNowPlaying = function (data) {
                let idList = [];
                for (let i = 0; i < songList.length; i++) {
                    idList.push(songList[i].id);
                }
                let position = idList.indexOf(data.id);
                _this.preloadNextAlbum(position + 1);
                $('.togglePlayer .wave').remove();
                $('.togglePlayer').append(`<img src="${data.wave}" class="wave">`);
                playing_id = data.id;
                // _this.getLike(playing_id);
                $('.worklist li').removeClass('on');
                $('.queue_list_ul li').removeClass('on');
                $('li[data-id="' + playing_id + '"]').addClass('on');
                $('.player .buffered').remove();
                let bgid = setTimeout(function () {
                    prevAlbum.remove();
                }, 500);
                $('.play_section').append(`<img class="js-front-album front-album" src="${data.artwork}" alt="${data.name}" title="${data.name}">`);
                let prevAlbum = $('.js-front-album:not(:last-child)');
                prevAlbum.addClass('t').removeClass('o');
                $('.js-front-album').on('load', function () {
                    $('.js-front-album').addClass('o');
                });
                $('.platform_list').html('');
                $('.listen_on').show();
                if (data.other_platform.length != 0) {
                    for (let i = data.other_platform.length - 1; i >= 0; i--) {
                        let logo_path = `img/${data.other_platform[i].name}.png`;
                        if(data.other_platform[i].logo){
                            logo_path = data.other_platform[i].logo;
                        }
                        $('.platform_list').append(`<li>
                            <a href="${data.other_platform[i].href}" target="_blank">
                                <img src="${logo_path}" alt="${data.other_platform[i].name}" class="platform_icon"> ${data.other_platform[i].name}
                            </a>
                        </li>`);
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
                let m3u8_src = data.src.split('.');
                m3u8_src = m3u8_src[0] + '.m3u8';
                if (Hls.isSupported()) {
                    let hls = new Hls();
                    hls.loadSource(m3u8_src);
                    hls.attachMedia(audio);
                }
                else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                    audio.src = m3u8_src;
                }else{
                    audio.src = data.src;
                }
                $('.text_process .all_time').text(durStr);
                _this.renderLyric(data.lyric);
                currentLyricIndex = 1;
            };
            this.renderList = function () {
                for (let i = 0; i < songList.length; i++) {
                    let classOn = '';
                    if (i == 0) {
                        classOn = 'on';
                    }
                    $('.queue_list_ul').append(`<li data-id="${songList[i].id}" class="${classOn}">
                        <div class="artwork">
                            <img src="${songList[i].artwork_s}" alt="${songList[i].name}">
                            <svg class="playing_this" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z" /></svg>
                        </div>
                        <div class="name">
                            ${songList[i].name}
                        </div>
                    </li>`);
                }
            };
            this.renderWorkList = function () {
                let idList = [];
                for (let i = 0; i < songList.length; i++) {
                    idList.push(songList[i].id);
                }
                let position = idList.indexOf(playing_id);
                for (let i = 0; i < songList.length; i++) {
                    let classOn = '';
                    if (i == position) {
                        classOn = 'on';
                    }
                    let genre = songList[i].genre;
                    let tags = '';
                    for (let j = 0; j < genre.length; j++) {
                        tags += '<span class="hashtag">' + genre[j] + '</span> ';
                    }
                    $('.worklist').append(`<li class="${classOn}" data-id="${songList[i].id}">
                        <div class="cover_block">
                            <div class="cover_wrap">
                                <img src="${songList[i].artwork}" alt="songList[i].name">
                                <div class="current_playing">
                                    <div class="fragment"></div>
                                    <div class="fragment"></div>
                                    <div class="fragment"></div>
                                    <div class="fragment"></div>
                                    <div class="fragment"></div>
                                </div>
                            </div>
                            <div class="workname">
                                <div class="song_title">${songList[i].name}</div>
                                <span class="lan" data-lanindex="released_on">${lan_pack.released_on}</span>: ${songList[i].release_date}<br>
                                ${tags}
                            </div>
                        </div>
                    </li>`);
                }
                $('body').addClass('worklist_rendered');
            };
            this.renderLyric = function (lyric) {
                $('.lyric ul').html('');
                $('.lyric .noLyric').removeClass('on');
                $.ajax({
                    url: lyric,
                    type: 'get',
                    dataType: 'json',
                    success: function (res) {
                        lyricContent = res;
                        let keys = Object.keys(res);
                        keys = keys.reverse();
                        for (let i = keys.length - 1; i >= 0; i--) {
                            $('.lyric ul').append(`<li data-time="${keys[i]}">${res[keys[i]]}</li>`);
                        }
                        $('.lyric ul li:nth-child(1)').addClass('ready');
                    },
                    error: function (e) {
                        console.log(e);
                        $('.lyric .noLyric').addClass('on').html(lan_pack.loading_err);
                    }
                });
            };
            this.renderNew = function (InData) {
                $('.now_playing span').html(lan_pack.new_single);
                $.ajax({
                    url: 'src/data.json',
                    type: 'get',
                    dataType: 'json',
                    success: function (res) {
                        songList = res;
                        let data = InData || songList[0];
                        _this.renderNowPlaying(data);
                        _this.initRoute();
                        let s1 = setTimeout(function () {
                            _this.renderList();
                        }, 1000);
                    },
                    error: function (e) {
                        console.log(e);
                        alert('Something went wrong');
                    }
                });
            };
            this.updateTime = function () {
                if (!globalAudioPaused) {
                    let t = audio.currentTime;
                    let _p = t / global_data.duration * 100;
                    $('.process_bar').css({
                        'width': _p + '%'
                    });
                    let _min = Math.floor(audio.currentTime / 60);
                    let _sec = audio.currentTime % 60;
                    _sec = _sec.toFixed(0);
                    if (_sec < 10)
                        _sec = '0' + _sec;
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
                    _this.updateWave(_p);
                }
            };
            this.updateWave = function (_p) {
                if(globalAudioPaused){
                    return false;
                }
                $('.wave').css({
                    'left': -(_p / 100 * 3600) + 46 + 'px'
                });
            }
            this.updateLyric = function () {
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
            };
            this.set_playSectionWidth = function () {
                let w = winW;
                if (winW > 800) {
                    w = 800;
                }
                $('.play_section').css({
                    'height': w + 'px'
                });
            };
            this.resize = function () {
                winW = $(window).width();
                if (winW > 800) {
                    $('body').removeClass('show_nav');
                }
                _this.set_playSectionWidth();
            };
            this.start = function (e) {
                e.stopPropagation();
                $('.text_process').addClass('on');
                $('.control').addClass('disabled');
                $('.process_bar').removeClass('t');
                p = $('.process_bar').width();
                $('.player').addClass('on');
                x = e.pageX || e.originalEvent.changedTouches[0].pageX;
            };
            this.move = function (e) {
                if ($(this).hasClass('on')) {
                    globalAudioPaused = true;
                    let nowX = e.pageX || e.originalEvent.changedTouches[0].pageX;
                    let abs = nowX - x;
                    let nowP = p + abs;
                    if (nowP <= winW && nowP >= 0)
                        $('.process_bar').css({
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
                    if (_sec < 10)
                        _sec = '0' + _sec;
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
            };
            this.end = function (e) {
                $('.text_process').removeClass('on');
                $('.control').removeClass('disabled');
                $('.player').removeClass('on');
                $('.process_bar').addClass('t');
                if (!globalAudioPaused) {
                    return false;
                }
                e.stopPropagation();
                p = $('.process_bar').width();
                let percent = p / $('.player').outerWidth();
                $('.process_bar').css({
                    'width': percent * 100 + '%'
                });
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
                currentLyricIndex = tempIndex + 1;
            };
            this.picStart = function (e) {
                e.stopPropagation();
                $('.all_pics_show').addClass('on');
                px = e.pageX || e.originalEvent.changedTouches[0].pageX;
                pp = $('.all_pics_show').width();
                p_percent = 0;
            };
            this.picMove = function (e) {
                if ($('.all_pics_show').hasClass('on')) {
                    let now_px = e.pageX || e.originalEvent.changedTouches[0].pageX;
                    let abs_px = now_px - px;
                    let percent = abs_px / pp;
                    p_percent = percent;
                    let trans_p = percent * 20;
                    let trans_p_next = trans_p + 20;
                    let trans_p_prev = trans_p - 20;
                    $('.pic_list li.on').css({
                        'transform': 'translateX(' + trans_p + '%)'
                    });
                    $('.pic_list li.next').css({
                        'transform': 'translateX(' + trans_p_next + '%)'
                    });
                    $('.pic_list li.prev').css({
                        'transform': 'translateX(' + trans_p_prev + '%)'
                    });
                }
            };
            this.picEnd = function (e) {
                $('.all_pics_show').removeClass('on');
                if (p_percent < -0.05) {
                    _this.showNextPic();
                }
                if (p_percent > 0.05) {
                    _this.showPrevPic();
                }
                $('.pic_list li').css({
                    'transform': 'translateX(0)'
                });
                $('.pic_list li.on').css({
                    'transform': 'translateX(0)'
                });
                $('.pic_list li.next').css({
                    'transform': 'translateX(20%)'
                });
                $('.pic_list li.prev').css({
                    'transform': 'translateX(-20%)'
                });
            };
            this.play = function () {
                $('.sample.on .sample_point').css({
                    'left': -1 + 'px'
                });
                $('.sample').removeClass('on');
                sample.pause();
                if (playCount < 1) {
                    $('body').addClass('active');
                }
                playCount++;
                $('.now_playing span.lan').html(lan_pack.now_playing);
                $('.now_playing span.lan').attr({
                    'data-lanindex': 'now_playing'
                });
                audio.volume = 1;
                if (!globalAudioPaused) {
                    audio.pause();
                    globalAudioPaused = true;
                } else {
                    $('body').addClass('loadstart');
                    audio.play();
                    if (!db.getItem('drag_tip')) {
                        db.setItem('drag_tip', 'played on this browser!');
                        let s1_fun = function () {
                            $('.drag_tip').addClass('on');
                            let s2 = setTimeout(s2_fun, 2500);
                        };
                        let s2_fun = function () {
                            $('.drag_tip').removeClass('on');
                        };
                        let s1 = setTimeout(s1_fun, 1000);
                    }
                    globalAudioPaused = false;
                    $('title').html(global_data.name);
                }
            };
            this.nextSong = function () {
                let thisItemsPostion = _this.getSongPosition(playing_id);
                let nextPosition = thisItemsPostion + 1;
                if (nextPosition >= songList.length) {
                    nextPosition = 0;
                }
                let nextSongData = songList[nextPosition];
                _this.renderNowPlaying(nextSongData);
                let return_this = {
                    data: {
                        this: _this
                    }
                };
                globalAudioPaused = true;
                _this.play(return_this);
            };
            this.prevSong = function () {
                let thisItemsPostion = _this.getSongPosition(playing_id);
                let prevPosition = thisItemsPostion - 1;
                if (prevPosition < 0) {
                    prevPosition = songList.length - 1;
                }
                let prevSongData = songList[prevPosition];
                _this.renderNowPlaying(prevSongData);
                let return_this = {
                    data: {
                        this: _this
                    }
                };
                globalAudioPaused = true;
                _this.play(return_this);
            };
            this.dismissQueue = function () {
                $('body').removeClass('show_queue');
            };
            this.showQueue = function () {
                $('body').addClass('show_queue');
            };
            this.keyEvents = function (e) {
                let k = e.keyCode;
                switch (k) {
                    case 37:
                        if (globalAudioPaused) {
                            break;
                        }
                        _this.prevSong();
                        break;
                    case 39:
                        if (globalAudioPaused) {
                            break;
                        }
                        _this.nextSong();
                        break;
                    default:
                        break;
                }
            };
        }
    }
    app = new app();
    app.load();
});