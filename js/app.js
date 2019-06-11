$(function() {
    let app = function() {
        let x, p, updateTimer;
        let globalAudioPaused = true;
        let data = {
            "name": "Leave - Borgeous / Jordyn Jnoes (Jacky.Q Remix)",
            "path": "src/addictionToYou/audio.mp3",
            "lyric":"src/addictionToYou/lyric.json",
            "duration": "232"
        };
        let winW = $(window).width();
        let audio = $('.audio')[0];
        let dur = data.duration;
        let min = Math.floor(dur / 60);
        let sec = dur % 60;
        let durStr = min + ':' + sec;
        let nolyric = false;
        let lyricContent = '';
        let screeenFits = true;

        this.init = function() {
            let _this = this;
            $('.player').on('mousedown touchstart', this.start);
            $('.player').on('mousemove touchmove', this.move);
            $('.player').on('mouseup touchend', {this:this} ,this.end);
            $(window).off('resize').on('resize', this.resize);
            this.resize();
            $('.text_process .all_time').text(durStr);
            $('.ctrl-icon').off().on('click', {this:this}, this.play);
            $('.playnpause').off().on('click', {this:this}, this.play);
            audio.src = data.path;
            audio.volume = 0;
            console.log($(audio))
            audio.onended = function() {
                console.log('ended')
                $('body').removeClass('playing');
                $('.text_process .now_time').text('0:00');
                $('.process_bar').css({'width':'0%'});
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
                globalAudioPaused = true;
                clearInterval(updateTimer);
                updateTimer = null;
                $('.lyric ul li').removeClass('on ready');
                $('.lyric ul li:first-child').addClass('ready');
                audio.src = data.path;
            }
            audio.onpause = function(){
                $('body').removeClass('playing');
                globalAudioPaused = true;
            }
            audio.onplay = function(){
                console.log('play')
                $('body').addClass('playing');
                globalAudioPaused = false;
            }
            let playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(function() {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = 1;
                }).catch(function(error) {
                    console.log(error)
                });
            }
            $.ajax({
                url:data.lyric,
                type:'get',
                dataType:'json',
                success:function(res){
                    if(res.nolyric){
                        nolyric = true;
                        $('.lyric').html('Just music, enjoy!');
                        return false;
                    }
                    lyricContent = res;
                    let keys = Object.keys(res);
                    keys = keys.reverse();
                    for (let i = keys.length - 1; i >= 0; i--) {
                        $('.lyric ul').append('<li data-time="'+keys[i]+'">'+res[keys[i]]+'</li>');
                    }
                    $('.lyric ul li:first-child').addClass('ready');
                },
                error:function(e){
                    $('.lyric').html('loading error!');
                }
            })
            // init route
            let changeRoute = function(where){
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
            let mywork = function(){
                changeRoute('mywork');
            }
            let aboutme = function(){
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
        this.updateTime = function() {
            let _this = this;
            updateTimer = setInterval(function() {
                let t = audio.currentTime;
                let _p = t / dur * 100;
                $('.process_bar').css({ 'width': _p + '%' });
                let _min = Math.floor(audio.currentTime / 60);
                let _sec = audio.currentTime % 60;
                _sec = _sec.toFixed(0);
                if (_sec < 10) _sec = '0' + _sec;
                if (_sec > 59) { _sec = '00';
                    _min++; }
                let _durStr = _min + ':' + _sec;
                if (audio.currentTime === 0) {
                    $('.text_process .now_time').text('0:00');
                    return false;
                }
                $('.text_process .now_time').text(_durStr);
                if(!nolyric && screeenFits){
                    _this.updateLyric();
                }
            },200)
        }
        this.updateLyric = function(){
            let keys = Object.keys(lyricContent);
            let tempObj = '';
            for (let i = keys.length - 1; i >= 0; i--) {
                if(audio.currentTime + 0.2 >= parseFloat(keys[i]))
                {
                    tempObj = $('.lyric ul li[data-time="'+ keys[i] +'"]');
                    tempObj.addClass('on').removeClass('ready');
                    try {
                        tempObj.next().addClass('ready');
                        tempObj.prev().removeClass('on ready');
                    } catch(e) {
                        console.log(e);
                    }
                    break;
                }
                if(audio.currentTime < parseFloat(keys[0])){
                    $('.lyric ul li:first-child').addClass('ready');
                }
            }
        }
        this.resize = function() {
            winW = $(window).width();
            if(winW < 1000){
                screeenFits = false;
            }else{
               screeenFits = true;
               $('.lyric ul li').removeClass('ready on');
            }
        }
        this.start = function(e) {
            e.stopPropagation();
            clearInterval(updateTimer);
            updateTimer = null;
            $('.process_bar').removeClass('t');
            p = $('.process_bar').width();
            $('.player').addClass('on');
            x = e.pageX || e.originalEvent.changedTouches[0].pageX;
        }
        this.move = function(e) {
            if ($(this).hasClass('on')) {
                let nowX = e.pageX || e.originalEvent.changedTouches[0].pageX;
                let abs = nowX - x;
                let nowP = p + abs;
                if (nowP <= winW && nowP >= 0) $('.process_bar').css({ 'width': nowP });
                let percent = nowP / winW;
                let _currentPosition = dur * percent;
                if (_currentPosition < 0) {
                    _currentPosition = 0;
                }
                if (_currentPosition > dur) {
                    _currentPosition = dur;
                }
                let _min = Math.floor(_currentPosition / 60);
                let _sec = _currentPosition % 60;
                _sec = _sec.toFixed(0);
                if (_sec < 10) _sec = '0' + _sec;
                if (_sec > 59) { _sec = '00';
                    _min++; }
                let _durStr = _min + ':' + _sec;
                if (audio.currentTime === 0) {
                    $('.text_process .now_time').text('0:00');
                    return false;
                }
                $('.text_process .now_time').text(_durStr);
            }
        }
        this.end = function(e) {
            _this = e.data.this;
            e.stopPropagation();
            $('.process_bar').addClass('t');
            $('.player').removeClass('on');
            p = $('.process_bar').width();
            let percent = p / winW * 100;
            $('.process_bar').css({ 'width': percent + '%' });
            let nowTime = dur * (p / winW);
            if (isNaN(nowTime)) {
                return false;
            }
            audio.currentTime = nowTime;
            if (nowTime < 1) {
                audio.currentTime = 0;
            }
            $('.lyric ul li').removeClass('on ready');
            if(screeenFits){
                _this.updateLyric();
            }
            clearInterval(updateTimer);
            updateTimer = null;
            let vs = setTimeout(function(){
                _this.updateTime();
            },200);
        }
        this.play = function(e) {
            let _this = e.data.this;
            $('body').addClass('active');
            audio.volume = 1;
            clearInterval(updateTimer);
            updateTimer = null;
            if (!globalAudioPaused) {
                $('body').removeClass('playing');
                audio.pause();
                globalAudioPaused = true;
            } else {
                $('body').addClass('playing');
                audio.play();
                globalAudioPaused = false;
                let vs = setTimeout(function(){
                    _this.updateTime();
                },200);
            }
        }
        this.nextSong = function() {

        }
        this.prevSong = function() {

        }
    }
    app = new app();
    app.init();
});