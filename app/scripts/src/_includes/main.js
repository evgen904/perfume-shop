$(function(){

    class ImageLoader {
      constructor($wrapper) {

        this.wrapper = $wrapper;
        this.width = $wrapper.width();
        this.height = $wrapper.height();
        this.src = $wrapper.data('src');
        this.mouseOn = false;
        this.animated = false;


        this.app = new PIXI.Application(this.width,this.height,{transparent: true});

        this.wrapper.append(this.app.view);


        this.container = new PIXI.Container();
        this.app.stage.addChild(this.container);

        this.load(this.startAnimation.bind(this));
      }

      load(afterLoad) {
        let that = this;
        let tmpImg = new Image();
        tmpImg.src = this.src;
        tmpImg.onload = function() {
            afterLoad();
            that.img = tmpImg;
        };

      }

      startAnimation() {
        let that = this;
        console.log(this.img);
        this.bg = PIXI.Sprite.fromImage(that.src);
        this.bg.width = this.width;
        this.bg.height = this.height;
        this.bg.position.x = 0;
        this.bg.position.y = 0;
        this.container.addChild(this.bg);

        this.displacementSprite = PIXI.Sprite.fromImage('../images/displacement.jpg');
        this.displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
        this.displacementFilter = new PIXI.filters.DisplacementFilter(
          this.displacementSprite
        );
        this.displacementFilter.scale.set(1e4 + Math.random()*1000);
        this.displacementSprite.scale.set(0.4 + 0.6*Math.random());

        this.app.stage.addChild(this.displacementSprite);

        this.container.filters = [this.displacementFilter];
        // this.click();
        let tl = new TimelineMax({onComplete:function() {that.animated = true;}});
            tl.to(that.displacementFilter.scale,1,{x:1,y:1});
        this.hover();
      }


      click() {
        // let that = this;
        // this.wrapper.on('click',function() {
        //  let tl = new TimelineMax({onComplete:function() {that.animated = true;}});
        //  tl.to(that.displacementFilter.scale,1,{x:1,y:1});
        // });
      }
      hover() {
        let that = this;

        this.wrapper.on('mouseenter',function() {
          if(!that.mouseon && that.animated) {
            that.mouseon = true;
            TweenMax.ticker.addEventListener('tick',that.doWaves, that);
            let tl = new TimelineMax();
            tl.to(that.displacementFilter.scale,0.5,{x:10,y:10});
          }
        });

        this.wrapper.on('mouseleave',function() {
          if(that.mouseon && that.animated) {
            that.mouseon = false;
            TweenMax.ticker.removeEventListener('tick',that.doWaves, that);
            let tl = new TimelineMax();
            tl.to(that.displacementFilter.scale,0.5,{x:1,y:1});
          }
        }); 
      }

      doWaves() {
        this.displacementSprite.x += 1;
      }
    }


    var targets = document.querySelectorAll('.js-loadme');

    var options = {
      rootMargin: '0px',
      threshold: [0,1]
    };

    var observer = new IntersectionObserver(items => {
      // console.log(items);
      items.forEach(el => {

        if(el.isIntersecting && el.intersectionRatio>0) {
                if(!$(el.target).hasClass('is-init')) {
                    $(el.target).addClass('is-init');
                    new ImageLoader($(el.target));
                    console.log('intersected',el.target);
                }
        }
      });
    }, options);

    for (var i = 0; i < targets.length; i++) {
      observer.observe(targets[i]);
    }


    $(document).scroll(function(){
        var scrolled = window.pageYOffset || document.documentElement.scrollTop;
        if (scrolled >= 200) {
            $('body').addClass('fixed');
        } else {
            $('body').removeClass('fixed');
        }
    });


    /* Регистрация манипуляции )) */

    $('.js-passwort-vergessen').on('click',function(event){
        event.preventDefault();

        $('.js-form-autorisierung').removeClass('active');
        $('.js-block-wiederherstellen').addClass('active');
        $('.js-login-title').text('ЗАБЫЛИ ПАРОЛЬ?');

        $('.login-top-nav > div:nth-child(1)').removeClass('active');
        $('.login-top-nav > div:nth-child(2)').addClass('active');
    });

    $('.btn-login-mob > div').on('click',function(){
        $('.btn-login-mob > div').removeClass('active');
        $(this).addClass('active');

        $('.js-login-wr > div').removeClass('active');
        $('.js-login-wr > div').eq($(this).index()).addClass('active');
    });

    $('.wiederherstellen-back span').on('click',function(){
        $('.login-top-nav > div:nth-child(2)').removeClass('active');
        $('.login-top-nav > div:nth-child(1)').addClass('active');

        $('.js-block-wiederherstellen').removeClass('active');
        $('.js-form-autorisierung').addClass('active');
    });







    s3Animator.once = true;

    var menuTop = $('.js-m-top-clone').clone();
    var socialClone = $('.js-social-clone').clone();
    var mailClone = $('.js-mail-clone').clone();
    var thumbProd = $('.js-clone-thumb').clone();
    var nameProd = $('.js-clone-name-prod').clone();

    $('.js-m-top-add').prepend(menuTop);
    $('.js-cont-append').append(mailClone);
    $('.js-append-soc').next().append(socialClone);
    $('.js-append-thumb').append(thumbProd);
    $('.js-append-name-prod').append(nameProd);

    $('.js-mob-filter').on('click',function(){
        if (!$(this).hasClass('active')) {
            $(this).addClass('active');
            $('.js-mob-filter-show').addClass('active');
        } else {
            $(this).removeClass('active');
            $('.js-mob-filter-show').removeClass('active');
        }
    });

    $('.js-menu-bot > li.hasclass > a').on('click',function(event){
        event.preventDefault();
        if ($(document).width() > 800) {
            document.location.href = $(this).attr('href');
        } else {
            if (!$(this).parent().hasClass('active')) {
                $(this).parent().addClass('active');
                $(this).next().slideDown();
            } else {
                $(this).parent().removeClass('active');
                $(this).next().slideUp();
            }
        }
    });

    $(document).on('click','.js-menu-popup',function(){
        if (!$(this).hasClass('active')) {
            $(this).addClass('active'); 
            $('.menu-burger').addClass('active');
            $('.js-select-vendor').removeClass('active');
        } else {
            $(this).removeClass('active'); 
            $('.menu-burger').removeClass('active');
        }        
    });
    $(document).on('click','.js-menu-popup-close',function(){
        $('.menu-burger, .js-menu-popup').removeClass('active');
    });



    $(document).on('click','.js-btn-vendor',function(event){
        event.preventDefault();
        $('.js-select-vendor').addClass('active');
    });
    $(document).on('click','.js-select-vendor-close',function(){
        $('.js-select-vendor').removeClass('active');
    });
        
    $('.js-vendor-item > li').on('click',function(){
        $('.js-vendor-item > li').removeClass('active');
        $(this).addClass('active');    
    });

    $('.js-open-btn-prod').on('click',function(){
        if (!$(this).hasClass('active')) {
            $(this).addClass('active');
            $('.js-open-body-prod').addClass('active');
        } else {
            $(this).removeClass('active');
            $('.js-open-body-prod').removeClass('active');
        }
    });


    $('.js-about').on('click',function(){
        if (!$(this).hasClass('active')) {
            $(this).addClass('active');
            $(this).next().show();
        } else {
            $(this).removeClass('active');
            $(this).next().hide();
        }
    });


    $('.js-search-btn').on('click',function(){
        if (!$(this).parent('.search').hasClass('active')) {
            $(this).parent('.search').addClass('active');
        } else {
            $(this).parent('.search').removeClass('active');
            $('.js-select-vendor').removeClass('active');
        }
    });

    $('.select-vendor-left-menu > li').each(function(){
        if ($(this).find('> ul').length) {
            $(this).addClass('hasclass');
            $(this).find('> ul').wrap('<div class="vendor-menu-popup"></div>');
        }
    });


    $('.js-btn-filter').on('click',function(){
        if (!$(this).hasClass('active')) {
            $('.js-btn-filter').removeClass('active');
            $('.js-btn-filter').next().slideUp();
            $(this).addClass('active');
            $(this).next().slideDown();
        } else {
            $(this).removeClass('active');
            $(this).next().slideUp();
        }
    });


    $(document).on('click','.js-thumbs-prod li',function(){
        $('.js-thumbs-prod li').removeClass('active');
        $(this).addClass('active');

        if ($(this).index() == 0) {
            $('.js-img-prod > div').eq(1).fadeOut();
        } else if ($(this).index() == 1) {
            $('.js-img-prod > div').eq(1).fadeIn();
        }
    });


    $('.products-tabs-nav span').on('click',function(){
        $('.products-tabs-nav span').removeClass('active');
        $(this).addClass('active');
        $('.products-tabs-body > div').removeClass('active').eq($(this).index()).addClass('active');
    });


    $(".slider-head-in").owlCarousel({
        nav : false,
        dots: true,
        loop: true,
        autoplay:true,
        autoplayTimeout: 7000,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        items:1,
        onTranslate: fadeBlock,
        onInitialize: function(){
            $('.slider-head').removeClass('no-slide');
        }
    });
    function fadeBlock(){
        $(".slider-head-text").removeClass('animated fadeInLeft');
        setTimeout(function(){
            $(".slider-head-text").addClass('animated fadeInLeft');
        },200);
    }

    $('.js-slider-prod').owlCarousel({
        nav : true,
        dots: false,
        loop: true,
        items:3,
        responsive:{
            0:{
                items:1,
                autoplay:true,
                autoplayTimeout: 7000
            },
            768:{
                items:2,
                autoplay:true,
                autoplayTimeout: 7000
            },
            960:{
                items:2,
                autoplay:true,
                autoplayTimeout: 7000
            },
            1200:{
                items:3
            }
        }
    });

    $('.js-slider-review').owlCarousel({
        nav : true,
        dots: false,
        loop: true,
        items:3,
        responsive:{
            0:{
                items:1,
                autoplay:true,
                autoplayTimeout: 7000
            },
            768:{
                items:2,
                autoplay:true,
                autoplayTimeout: 7000
            },
            960:{
                items:2,
                autoplay:true,
                autoplayTimeout: 7000
            },
            1200:{
                items:3
            }
        }
    });


    $('.js-slider-product-order').owlCarousel({
        nav : true,
        dots: false,
        loop: true,
        items:1
    });



    $('.js-tabs-card-title > div').on('click',function(){
        $('.js-tabs-card-title > div, .js-tabs-card-body > div').removeClass('active');
        $(this).addClass('active');
        $('.js-tabs-card-body > div').eq($(this).index()).addClass('active');
    });



    
});