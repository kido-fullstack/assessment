var slide_ind = 1;

document.addEventListener('scroll', function (event) {
    var scroll = window.scrollY;
    var nav_offset_top = 50;
    var min_body_height = $(".nav_div").height() * 10;

    // console.log(min_body_height);

    if ($('body').height() > min_body_height) {
        (scroll >= nav_offset_top)? $(".nav_div").addClass("navbar_fixed") : $(".nav_div").removeClass("navbar_fixed");
        (scroll >= nav_offset_top)? $("#sub_cat_slider").addClass("navbar_fixed") : $("#sub_cat_slider").removeClass("navbar_fixed");
    }
    // $(".nav_div").removeClass("navbar_fixed")
    if(scroll == 0){
        $(".nav_div").removeClass("navbar_fixed");
        $("#sub_cat_slider").removeClass("navbar_fixed");
    }

},true);

document.location.hash = "";

//---------------------------------------INTERVALS----------------
var caros_inter , feat_inter;

//--------------------------------------GLOBALS---------------------------------------
var units = {'1':'gram','2':'kilo','3':'ml','4':'litre' ,'5':'dozen' ,'6':'unit' ,'7':'per piece'};

var categories = {
    "1"  : "BEVERAGES",
    "2"  : "COOKING_OIL",
    "3"  : "GHEE",
    "4"  : "DALS_&_PULSES",
    "6"  : "DRY_FRUITS",
    "7"  : "FLOURS_&_GRAINS",
    "9"  : "MASALA",            
    "11" : "RICE_&_RICE_PRODUCTS",
    "13" : "SALT_SUGAR_JAGGERY",
    "14" : "BAKERY",
    "15" : "CHOCOLATES & BISCUITS",
    "16" : "COLD_DRINKS",
    "17" : "DAIRY",
    "18" : "FROZEN",
    "20" : "PERSONAL_CARE",
    "21" : "STAPLES",
    "22" : "FRUITS_&_VEGETABLES",
    "23" : "NON_VEG",
    "25" : "CAKES_&_ICECREAM",
    "26" : "SNACKS_&_FARSAN",
    "28" : "BABY_CARE",
    "29" : "HOME_CARE",
    "30" : "FABRIC_CARE_&_WASH",
};

function format_date(dt_obj) {
    var month = '' + (dt_obj.getMonth() + 1),
        day = '' + dt_obj.getDate(),
        year = dt_obj.getFullYear();
    (month.length < 2) ? month = '0' + month: false;
    (day.length < 2) ? day = '0' + day: false;
    return [year, month, day].join('-');
}
//-------------------------------SETTING TODAY----------------------
var today = format_date(new Date());
//-------------------------------COMMON FUNCTIONS----------------------
function local_get(var_name) {
    try {
        var out = JSON.parse(localStorage.getItem(var_name));
    } catch (e) {
        return localStorage.getItem(var_name);
    }
    return out;
}

(local_get('cart') == ({} || [])) ? localStorage.clear() : false;

function local_set(var_name, value) { localStorage.setItem(var_name, JSON.stringify(value)); }

function requester(end_point, req_type, params) {
    // var authToken = 'Bearer ' + local_get('access_token');
    return $.ajax({
        url: end_point,
        // beforeSend: function(req) { req.setRequestHeader("Authorization", authToken); },
        type: req_type,
        async: false,
        cache: false,
        timeout: 3000,
        data: params,
        success: function(resp) {},
        error: function(x,t,m){
            if(t==="timeout") {
                requester(end_point, req_type, params);
            }
        }        
    }).responseText;
}


function navigator(view_name) {
    clearInterval();
    $.ajax({
        url:view_name+".html",
        type:'GET',
        cache:false,
    }).done(function(data) {
        $('#main_container').empty().html(data);
        document.location.hash = view_name;
    });
}

function navto(page) {
    $('#main_container').empty().html('<img style="margin-top:45vh" src="images/loading.gif" alt="Loading" />');
    document.location.hash = page;
}

$(document).on('click','.navigate',function(){
     navto($(this).attr("link"));
});

window.onhashchange = function() {
    var link = (document.location.hash).replace(/#/g,"");
    (link != "") ? navigator(link) : false;
}



//------------------------------------------------------------------------------------------

function ImgError(img) {
    img.src = "images/logo_n.jpeg";
}

var type = 'POST';
var params = {'api':'get_items'};
var all_items =  JSON.parse(requester(url,type,params));
// console.log(all_items);
local_set('items',all_items);
local_set('sub_cats',JSON.parse(requester(url,type,{'api':'get_sub_cat'})));


function update_home() {
    var categ_card = $('.categ_banner:first');
    var offr_card = $('.offr_itm:first');
    // console.log(local_get("cart"));
    $('#categ_list').empty();
    $('#offer_slid').empty();
    $.each(categories, function (k, v) {
            var categ  = categ_card.clone();
            var cat_nm = v.replace(/_/g," ");
            categ.find('.categ_desc').text(cat_nm);
            categ.find('.categ').attr('categ_id',parseInt(k));
            var bgrnd = {
                'background-color':'transparent',
                'background-image':'url("images/categories/'+v+'.jpg"), url("images/logo.png")',
                'background-repeat': 'no-repeat',
                'background-origin': 'centre',
                'background-size': '100% 100%',
            }
            categ.find('.categ').css(bgrnd);
            $('#categ_list').append(categ);
            $('#categ_slider').append("<div class='box' categ_id='"+parseInt(k)+"'><div class='box_img'>"+cat_nm+"<br class=''><img src='images/categories/"+v+".jpg' onerror='ImgError(this)' alt=''></div></div>");
    });

    var disc_arr = [];

    $.each(local_get("items"), function (k, v) {
        if(v.discount){
            v["id"] = k;
            v["off"] = (parseFloat(v.price) - parseFloat(v.discount));
            disc_arr.push(v);
        }
    });
    disc_arr = arr_key_sort(disc_arr,"off");

    $.each(disc_arr, function (i, v) {

            var offr  = offr_card.clone();var k = v['id'];
            offr.find('.itm_nam').text(v.name);
            offr.find('b').text(v.discount);
            offr.find('s').text(v.price);
            offr.find('.quan').text(v.quantity+" "+units[v.unit]);
            // var perc = (100 -(((v.discount/v.price) * 100))).toFixed(2);
            var perc = (parseFloat(v.price) - parseFloat(v.discount))+"/-";
            offr.find('.offr_bage').text(perc);
            offr.attr('item',parseInt(k));
            var bgrnd = {
                'background-color':'transparent',
                'background-image':'url("images/'+v.image+'"), url("images/logo.png")',
                'background-repeat': 'no-repeat',
                'background-origin': 'centre',
                'background-size': '95% 95%',
            }
            offr.find('.itm_img').css(bgrnd);
            $('#offer_slid').append(offr);
    });

}

function arr_key_sort(arr,key) {
    arr.sort(function(a,b) {
        return  b[key] - a[key];
    });
    return arr;
}


//------------------------------------------------------------------------------------------

function filter_itms(name) {
    var match_itms = {};
    if(name.length > 2){
        $.each(local_get('items'), function (k, v) {
            if((v.name.toLowerCase()).indexOf(name) !== -1){
                match_itms[k] = v;
            }
        });
        return match_itms;
    }
}

$(document).on('keyup','.item_srch',function(){

    var itms =  filter_itms($(this).val());
    
});


function lame() {
    document.getElementById('myAudio').muted = false;
    document.getElementById('myAudio').play();
}


function slider_inite() {
    // window.addEventListener('load', function() {
    clearInterval(caros_inter);
    clearInterval(feat_inter);
    var categ_slider = document.getElementById("categ_slider");
    var offer_slider = document.getElementById("offer_slid");

    $("#myAudio").click();

    var slide_ind = 0;
    feat_inter = setInterval(function(){
            //--------------------------------------FEATURED SLIDER---------------------
            $('#track').addClass("trans");
            slide_ind++;
            if(slide_ind > 3){
                $('#track').removeClass("trans").css("transform","translateX(0px)");slide_ind = 0;
            }else{
                $('#track').css("transform","translate3d(-"+(100 * slide_ind)+"vw, 0px, 0px)");
            }
            //--------------------------------------TOP SLIDER-----------------
            if($('#categ_slider').attr("stop_slid") == 0){
                categ_slider.scrollLeft += window.innerWidth;
                (categ_slider.scrollLeft >= (categ_slider.scrollWidth - window.innerWidth)) ? categ_slider.scrollLeft = 0 : false;
            }
            //--------------------------------------OFFER SLIDER-----------------
            if($('#offer_slid').attr("stop_slid") == 0){
               offer_slider.scrollLeft += window.innerWidth;
               (offer_slider.scrollLeft >= (offer_slider.scrollWidth - window.innerWidth)) ? offer_slider.scrollLeft = 0 : false;
            }

    }, 2000);

    var big_slid = 0;
    caros_inter = setInterval(function(){
        big_slid++;
        if(big_slid > 3){
            big_slid = 1;
        }
        var img = $( window ).width() < 800  ? big_slid+'_mob' : big_slid;
        var style = {
            'background':'transparent url("images/slide'+img+'.jpeg") no-repeat center',
            'background-size':'cover',
            };
        $('.slide').css('display','none').css(style).fadeIn(300);
        
    }, 2000);

    // });

}


$(document).ready(function() {
// window.addEventListener('load', function() {
    // navto('admin');
    // logout();
    clearInterval();
    // navto('product');
    navto('home');
    // navto('cart');
    // navto('item');

    // function playAudio() {
    // }
    
    // document.location.hash = "";
    // navto('cart');
// });
});



// $('#categ_slider').bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup', function(evt) {
//     console.log("scrolled");
// });


//------------------------------------------------------------------------------------------

$('body').on('focus', ".datepicker", function() {
    if (!$(this).hasClass('dtp_set')) {
        $(this).bootstrapMaterialDatePicker({
            time: false,
            clearButton: true,
            todayHighlight: true
        });
        $(this).addClass('dtp_set');
    }
});

$('body').on('focus', ".time", function() {
    $(function() {
        $('.time').bootstrapMaterialDatePicker({
            date: false,
            format: 'HH:mm'
        });
    });
});

$("body").on("focus", "#chkveg", function() {
    $(function() {
        $('#chkveg').multiselect({
            includeSelectAllOption: true
        });
    });
});

//--------------------------------------PADD CHARS---------------------------------------

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//--------------------------------------CATEGORY HOVER---------------------------------------

$(document).on('touchstart','body',function(event){

    var myLocation = event.originalEvent.changedTouches[0];
    var realTarget = document.elementFromPoint(myLocation.clientX, myLocation.clientY);

    ($(realTarget).closest("#categ_slider").length) ? $("#categ_slider").attr('stop_slid',1) : $("#categ_slider").attr('stop_slid',0);
    ($(realTarget).closest("#offer_slid").length) ? $("#offer_slid").attr('stop_slid',1) : $("#offer_slid").attr('stop_slid',0);

});

$(document).on('click','.sub_cat_btn',function(){

    $('.sub_cat_btn').removeClass('active').removeClass('move');

    $(this).addClass('active');
    // $(this).addClass('active').addClass('move');

    $('.itm_card').removeClass('hidden_prod');

    if($(this).attr("subcat_id") != 0){
        var sel_sub_cat = $(this).attr("subcat_id");
        $('.itm_card').each(function() {
            if(sel_sub_cat != $(this).attr("sub_cat_id")){
                // $(this).css('display','none');
                $(this).addClass('hidden_prod');
            }
        });
    }
    // var tot_prods = $('.itm_card').length;
    // var hidden_prods = $('.hidden_prod').length;

    var shon_prods = $('.itm_card').length - $('.hidden_prod').length;

    // console.log(shon_prods);

    $("#selected_count").text('Showing : '+shon_prods);

});




$(document).on('mouseenter','#categ_slider,#offer_slid',function(e){
    $(this).attr('stop_slid',1);
});
$(document).on('mouseleave','#categ_slider,#offer_slid',function(e){
    $(this).attr('stop_slid',0);
});


//--------------------------------------CATEGORY CLICK---------------------------------------
$(document).on('click','.categ,.box',function(){
    local_set('selected_categ',$(this).attr('categ_id'));
    navto('product');
});
//--------------------------------------ADD CART---------------------------------------

$(document).on('click','.add_cart',function(){
    var card = $(this).closest('.itm_card');
    var items = local_get("items");
    var item_count = parseInt(card.find('.item_count').text());
    if(item_count <= 9){
        var desc = card.find('.prod_desc').text();
        var price = card.find('.prod_selec').find("option:selected" ).attr('price');
        var quantity = card.find('.prod_selec').find("option:selected" ).val();
        var item_id = card.attr('item_id');
        var item_img = card.attr('img');
        var curr_cart = local_get('cart') || [];
        // console.log(curr_cart);
        curr_cart.push({'desc':desc,'price':price,'quantity':quantity,'id':item_id,'img':item_img,'unit':items[item_id]["unit"]});
        local_set('cart',curr_cart);
        cart_itm_count();
    }else{
        alert("Can not add more.");
    }
});

//--------------------------------------SUBTRACT CART---------------------------------------

$(document).on('click','.subt_cart',function(){
    var card = $(this).closest('.itm_card');
    var item_count = parseInt(card.find('.item_count').text());
    // console.log(item_count);
    if(item_count > 0){
        var item_id = card.attr('item_id');
        reduce_cart_item(item_id);
        cart_itm_count();
    }else{
        alert("Can not reduce more.");
    }
});

function reduce_cart_item(item_id) {
    var curr_cart = local_get('cart') || [];
    $.each(curr_cart, function (k, v) {
        if(parseInt(v.id) == parseInt(item_id)){
            curr_cart.splice(k, 1);
            local_set('cart',curr_cart);
            return false;
        }
    });
}




//--------------------------------------REDUCE CART ITEM---------------------------------------
$(document).on('click','.reduce_cart_item',function(){
    var card = $(this).closest('.item_row');
    var item_id = card.attr('item_id');
    reduce_cart_item(item_id);
    update_cart_page();
});


//--------------------------------------INCREASE CART ITEM---------------------------------------
$(document).on('click','.increase_cart_item',function(){
    var card = $(this).closest('.item_row');
    var prod_id = card.attr('item_id');
    var curr_cart = local_get('cart') || [];
    $.each(curr_cart, function (k, v) {
        if(parseInt(v.id) == prod_id){
            curr_cart.push(v);
            local_set('cart',curr_cart);
            return false;
        }
    });
    update_cart_page();
});

//--------------------------------------REMOVE CART ITEM---------------------------------------
$(document).on('click','.remove_cart_item',function(){
    var card = $(this).closest('.item_row');
    var prod_id = card.attr('item_id');
    var curr_cart = local_get('cart') || [];
    var fin_cart = [];

    $.each(curr_cart, function (k, v) {
        if(parseInt(v.id) != parseInt(prod_id)){
            fin_cart.push(v);
        }
    });
    local_set('cart',fin_cart);
    update_cart_page();
});


$(document).on('click','#confirm_btn',function(){
    $("#confirm_btn").attr("disabled", true);
    var tester = "",user_phone =$("#country_code").text()+$("#user_phone").text(),user_name = $("#user_name").text();
    local_get('cart') == null ? tester += "Cart is empty. " : (local_get('cart').length == 0) ? tester += "Cart is empty. " : false;
    user_name   == "" ? tester += "Please provide Name. " : false;

    var address = ($("textarea#address_box").val().indexOf($("#pincode").val()) !== -1 ) ? $("textarea#address_box").val() : $("textarea#address_box").val()+' '+$("#pincode").val();

    $("#user_phone").text()  == "" ? tester += "Please provide Phone. " : false;
    ($("textarea#address_box").val() == "") ? tester += "Please provide Address. " : false;
    var user = {"name":user_name,"phone":user_phone,"address":address};
    var type = 'POST';
    var params = {'api':'save_order','user':user,'order':local_get('cart')};
    if(tester == ""){
        var ord = requester(url,type,params);
        if(!isNaN(parseInt(ord))){
            var inv =  print_order_pdf(ord);
            if(inv){
                alert("Order placed with order id :"+ord+". Invoice is downloaded.");
                local_set('cart',[]);
                local_set('client',user);
                update_cart_page();
                navto("home");
            }
        }else{
            update_cart_page();
        }
    }else{
        alert(tester);
        $("#confirm_btn").attr("disabled", false);
    }
});

function print_order_pdf(ord_id) {

    var units = {'1':'gram','2':'kilo','3':'ml','4':'litre' ,'5':'dozen' ,'6':'unit' ,'7':'per piece'};
    var day = new Date();var time = day.getHours() + ":" + day.getMinutes() + ":" + day.getSeconds();
    var dateTime = format_date(day)+' '+time;
    var cart_items = local_get('cart');var cart_group_items = {};var cart_total = 0;
    var doc = new jsPDF('l', 'mm', [297, 210]);var margin = 0;
    var mop = $("input[name='mop']:checked").val();
    var head = "<div><img width='45' height='15' src='images/logo_new.jpeg' alt='' /><h1>Order Id: "+ord_id+"</h1><h5>Placed on : "+dateTime+" Mode of Payment : "+mop+"</h5></div>";
    var cart_table = "<table border='1' sytle='width:`720px`'><tr><td>Name</td><td>Price</td><td>Quantity</td><td>Units</td><td>Amount</td></tr>";
    $.each(cart_items, function (k, v) {
        cart_group_items[v.id] == undefined ? cart_group_items[v.id] = [] : false;
        cart_group_items[v.id].push(v);
        cart_total += parseFloat(v.price);
    });

    $.each(cart_group_items, function (k, v) {
        var i = v[0];
        if(i.desc != "undefined"){
            var quan = (i.quantity);
            cart_table += "<tr><td>"+i.desc+"</td><td>"+i.price+"</td><td>"+quan+"</td><td>"+v.length+"</td><td>"+(i.price)*v.length+"</td></tr>";
        }
    });

    cart_table += "<tr><td>Total</td><td></td><td></td><td></td><td>"+cart_total+"</td></tr></table>";


    return doc.fromHTML(head+cart_table, 1, 1, {'width': 760},function(bla){
        doc.setFont("helvetica");
        doc.setFontType("bold");
        doc.setFontSize(9);
        doc.save("OrderId_"+ord_id+":asdMart.pdf");
    },margin);
}

//--------------------------------------SEARCH---------------------------------------
$(document).on('keyup','#search_inp',function(){
    $("#search_res").empty();
    var val = ($(this).val()).toLowerCase();
    // console.log(val);
    if(val.length > 1){
        var lis_count = 0;
        $.each(local_get('items'), function (k, v) {
            if(((v.key_words).toLowerCase()).indexOf(val) !== -1 && lis_count < 5){
                var quan = v.quantity +' '+ units[v.unit];
                $("#search_res").append("<div class='srch_lis' item="+v.id+">"+v.name+" - "+quan+"</div>");
                lis_count++;
            }
        });
    }
});

//--------------------------------------SEARCH---------------------------------------
$(document).on('click','.srch_lis,.offr_itm',function(){
    local_set("selected_item",$(this).attr("item"));
    $("#search_res").empty();
    $("#search_inp").val("");
    (document.location.hash == "#item") ? update_item_page() : navto('item');
});
function update_item_page() {

    var v = local_get('items')[local_get('selected_item')];
    var item  = $("#prod_card");
    item.find('.prod_selec').empty();
    item.find('.prod_desc').text(v.name);
    item.attr('item_id',v.id);
    item.attr('img',v.image);
    (v.is_veg == 0) ? item.find('.veg_nv').attr("src","images/icons/nveg.png") : false;

    var item_categ = item.category_id;
    var optns = '';
    var item_type = v.quantity +' '+ units[v.unit];
    var price = v.price;

    if(v.discount){
        price = v.discount;
        item.find('.offr_div').text((v.price - v.discount)+"/-");
        item.find('.col-content').attr('style','background: transparent url("images/icons/offer_bg.svg") no-repeat 99% 13%;background-size:17%;');
        item.find('.mrp_div').html('MRP : <s class="cut_amnt">'+v.price+'</s>');
    }else{
        item.find('.offr_div').text("");
        item.find('.col-content').attr('style','background: initial');
        item.find('.mrp_div').html("");
    }
    optns += '<option sel_itm_id="'+v.id+'" price="'+price+'" value="'+item_type+'" >'+item_type+' - &#x20B9; '+price+'</option>';
    item.find('.prod_selec').append(optns);
    item.find('.item_count').attr('item_id',v.id);
    item.find('.prod_selec').addClass('selec_no_arrow');
    // item.find('.card_mrp').text("MRP - "+v.price);

    var bgrnd = {
        'background-color' :'transparent',
        'background-image' :'url("images/'+v.image+'")',
        'background-repeat': 'no-repeat',
        'background-origin': 'centre',
        'background-size': 'contain',
    }

    if(v.stock == 0){
        bgrnd = {
            "background-color":'transparent, white',
            "background-image":'url("images/icons/out_of_stock.png"), url("images/'+v.image+'")',
            "background-position":" center, center",
            "background-repeat":" no-repeat, no-repeat",
            "background-size": "contain",
        }
        item.find('.add_cart').attr("disabled",true);
        item.find('.subt_cart').attr("disabled",true);
        item.find('.item_count').text("Out of stock");
        item.find('small').text("");
    }else{
        item.find('.add_cart').attr("disabled",false);
        item.find('.subt_cart').attr("disabled",false);
    }
    item.find('.prod_img').css(bgrnd);    
}


//--------------------------------------UPDATE CART---------------------------------------
function update_cart_page() {
    var cart_items = local_get('cart');
    var itm_card = $('.item_row:first');
    $('#cart_table').empty();

    var cart_group_items = {};
    var cart_total = cart_count = 0;

    $.each(cart_items, function (k, v) {
        cart_group_items[v.id] == undefined ? cart_group_items[v.id] = [] : false;
        cart_group_items[v.id].push(v);
        cart_total += parseFloat(v.price);
    });

    $.each(cart_group_items, function (k, v) {
        var i = v[0];
        var item  = itm_card.clone();
        item.find('.cart_item_desc').text(i.desc+" - "+i.quantity);
        item.find('.cart_item_price').text((i.price)*v.length);
        item.find('.list_item_count').text(v.length);
        item.attr('item_id',i.id);
        item.find('.cart_item_img').attr('style','background: transparent url("images/'+i.img+'") no-repeat center;background-size: contain;');
        $('#cart_table').append(item);
    });

    (local_get('cart') != null) ? cart_count = local_get('cart').length : false;

    $('.cart_amount,#cart_total,#sub_total,#grand_total').text(cart_total);
    $('.cart_count').text(cart_count);

    (!cart_count) ? $('#cart_table').append("<h3>Your cart is empty.</h3>"): false;
}
//--------------------------------------TAB CLICK---------------------------------------


if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
      };
      latt=pos.lat;
      lngg=pos.lng;
      console.log("point :"+latt+","+lngg);
    }, function() {
    });
  } else {
    // Browser doesn't support Geolocation
  }



function cart_itm_count() {
    $("span.cart_count").text("0");
    var cart_itms = local_get('cart') || [];
    var cart_tot = 0;
    var itm_counts = {};

    $.each(cart_itms, function (k, v) {
        itm_counts[v.id] == undefined ? itm_counts[v.id] = 1 : itm_counts[v.id]++;
        cart_tot += parseFloat(v.price);
    });

    $.each(itm_counts, function (k, v) {
        var count_spn = $("span.item_count[item_id="+k+"]");
        count_spn.text(v);
    });
    $('.cart_count').text(cart_itms.length);
    $('.cart_amount').text(cart_tot);
}
//--------------------------------------TAB CLICK---------------------------------------
$(document).on('click','.tab_nav',function(){
    $('.tab_div').removeClass('active');
    $('.tab_nav').removeClass('active');
    $('#' + $(this).attr('target')).addClass('active');
    $(this).addClass('active');
});

//--------------------------------------TAB CLICK---------------------------------------
$(document).on('change','.prod_selec',function(){

    
    var card = $(this).closest('.itm_card');
    var prod_id = $(this).find("option:selected" ).attr('sel_itm_id');
    var itms = local_get('items');var img_bw="";
    v = itms[prod_id];

    if(v.discount){
        card.find('.offer_img').text((v.price - v.discount)+"/-");
        card.find('.offer_img').attr('style','background: transparent url("images/icons/offer_bg.svg") no-repeat;background-size:contain;');
        card.find('.card_mrp').css("text-decoration","line-through");
    }else{
        card.find('.offer_img').css({'background':'initial','background-color':'transparent'});
        card.find('.card_mrp').css("text-decoration","initial");
    }

    card.find('.prod_desc').text(v.name);
    card.find('.item_count').attr('item_id',v.id);
    card.find('.item_count').text("0");
    card.find("small").text("In cart");
    card.attr('item_id',v.id);
    (v.is_veg == 0) ? card.find('.veg_nv').attr("src","images/icons/nveg.png") : false;
    card.attr('sub_cat_id',v.sub_cat_id);
    card.attr('img',v.image);
    card.find('.card_mrp').text("MRP :"+v.price);

    if(v.stock == 0){
        // img_bw = " -webkit-filter: grayscale(100%);filter: grayscale(100%); ";
        card.find('.add_cart,.subt_cart').attr("disabled",true);
        card.find('.item_count').text("Out of stock");
        card.find('small').text("");
        var bc_img = {
            "background-color":'transparent, white',
            "background-image":'url("images/icons/out_of_stock.png"), url("images/'+v.image+'")',
            "background-position":" center, center",
            "background-repeat":" no-repeat, no-repeat",
            "background-size": "contain",
        }
        card.find('.itm_img_div').css(bc_img);
    }else{
        card.find('.add_cart').attr("disabled",false);
        card.find('.subt_cart').attr("disabled",false);
        card.find('.itm_img_div').attr('style','background: white url("images/'+v.image+'") no-repeat center;background-size: contain; '+img_bw);
    }


    cart_itm_count();
});

function logout() {
    localStorage.clear();
    location.reload();
}
