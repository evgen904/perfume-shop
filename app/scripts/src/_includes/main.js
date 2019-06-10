$(function(){

        var hoverEffect = function(opts) {
            var vertex = `
                varying vec2 vUv;
                void main() {
                  vUv = uv;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `;

            var fragment = `
                varying vec2 vUv;

                uniform sampler2D texture;
                uniform sampler2D texture2;
                uniform sampler2D disp;

                // uniform float time;
                // uniform float _rot;
                uniform float dispFactor;
                uniform float effectFactor;

                // vec2 rotate(vec2 v, float a) {
                //  float s = sin(a);
                //  float c = cos(a);
                //  mat2 m = mat2(c, -s, s, c);
                //  return m * v;
                // }

                void main() {

                    vec2 uv = vUv;

                    // uv -= 0.5;
                    // vec2 rotUV = rotate(uv, _rot);
                    // uv += 0.5;

                    vec4 disp = texture2D(disp, uv);

                    vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
                    vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (disp.r*effectFactor), uv.y);

                    vec4 _texture = texture2D(texture, distortedPosition);
                    vec4 _texture2 = texture2D(texture2, distortedPosition2);

                    vec4 finalTexture = mix(_texture, _texture2, dispFactor);

                    gl_FragColor = finalTexture;
                    // gl_FragColor = disp;
                }
            `;

            var parent = opts.parent || console.warn("no parent");
            var dispImage = opts.displacementImage || console.warn("displacement image missing");
            var image1 = opts.image1 || console.warn("first image missing");
            var image2 = opts.image2 || console.warn("second image missing");
            var intensity = opts.intensity || 1;
            var speedIn = opts.speedIn || 1.6;
            var speedOut = opts.speedOut || 1.2;
            var userHover = (opts.hover === undefined) ? true : opts.hover;
            var easing = opts.easing || Expo.easeOut;

            var mobileAndTabletcheck = function() {
              var check = false;
              (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
              return check;
            };

            var scene = new THREE.Scene();
            var camera = new THREE.OrthographicCamera(
                parent.offsetWidth / -2,
                parent.offsetWidth / 2,
                parent.offsetHeight / 2,
                parent.offsetHeight / -2,
                1,
                1000
            );

            camera.position.z = 1;

            var renderer = new THREE.WebGLRenderer({
                antialias: false,
                // alpha: true
            });

            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setClearColor(0xffffff, 0.0);
            renderer.setSize(parent.offsetWidth, parent.offsetHeight);
            parent.appendChild(renderer.domElement);

            // var addToGPU = function(t) {
            //     renderer.setTexture2D(t, 0);
            // };

            var loader = new THREE.TextureLoader();
            loader.crossOrigin = "";
            var texture1 = loader.load(image1);
            var texture2 = loader.load(image2);

            var disp = loader.load(dispImage);
            disp.wrapS = disp.wrapT = THREE.RepeatWrapping;

            texture1.magFilter = texture2.magFilter = THREE.LinearFilter;
            texture1.minFilter = texture2.minFilter = THREE.LinearFilter;

            texture1.anisotropy = renderer.getMaxAnisotropy();
            texture2.anisotropy = renderer.getMaxAnisotropy();

            var mat = new THREE.ShaderMaterial({
                uniforms: {
                    effectFactor: { type: "f", value: intensity },
                    dispFactor: { type: "f", value: 0.0 },
                    texture: { type: "t", value: texture1 },
                    texture2: { type: "t", value: texture2 },
                    disp: { type: "t", value: disp }
                },

                vertexShader: vertex,
                fragmentShader: fragment,
                transparent: true,
                opacity: 1.0
            });

            var geometry = new THREE.PlaneBufferGeometry(
                parent.offsetWidth,
                parent.offsetHeight,
                1
            );
            var object = new THREE.Mesh(geometry, mat);
            scene.add(object);

            var addEvents = function(){
                var evtIn = "mouseenter";
                var evtOut = "mouseleave";
                if (mobileAndTabletcheck()) {
                    evtIn = "touchstart";
                    evtOut = "touchend";
                }
                parent.addEventListener(evtIn, function(e) {
                    TweenMax.to(mat.uniforms.dispFactor, speedIn, {
                        value: 1,
                        ease: easing
                    });
                });

                parent.addEventListener(evtOut, function(e) {
                    TweenMax.to(mat.uniforms.dispFactor, speedOut, {
                        value: 0,
                        ease: easing
                    });
                });
            };

            if (userHover) {
                addEvents();
            }

            window.addEventListener("resize", function(e) {
                renderer.setSize(parent.offsetWidth, parent.offsetHeight);
            });


            this.next = function(){
                TweenMax.to(mat.uniforms.dispFactor, speedIn, {
                    value: 1,
                    ease: easing
                });
            }

            this.previous = function(){
                TweenMax.to(mat.uniforms.dispFactor, speedOut, {
                    value: 0,
                    ease: easing
                });
            };

            var animate = function() {
                requestAnimationFrame(animate);

                renderer.render(scene, camera);
            };
            animate();
        };



var srcImg1 = $('.image-1').data('src');
var srcImg2 = $('.image-2').data('src');
var srcImg3 = $('.image-3').data('src');


// Hover Effects 
new hoverEffect({
  parent: document.querySelector('.image-1'),
  intensity1: 0.1,
  intensity2: 0.1,
  angle2: Math.PI / 2,
  image1: srcImg1,
  image2: srcImg1,
  displacementImage: '../images/displacement.png'
});

// Hover Effects 
new hoverEffect({
  parent: document.querySelector('.image-2'),
  intensity1: 0.1,
  intensity2: 0.1,
  angle2: Math.PI / 2,
  image1: srcImg2,
  image2: srcImg2,
  displacementImage: '../images/displacement.png'
});

// Hover Effects 
new hoverEffect({
  parent: document.querySelector('.image-3'),
  intensity1: 0.1,
  intensity2: 0.1,
  angle2: Math.PI / 2,
  image1: srcImg3,
  image2: srcImg3,
  displacementImage: '../images/displacement.png'
});




        /*

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

        */






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