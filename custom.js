var slide_ind = 1;
var url = ((document.location.host).indexOf("localhost") !== -1) ? 'http://localhost/assessment/apis/api.php' : 'https://dev.kido.school/questions/apis/api.php';
function ImgError(img) {
    img.src = "images/logo_n.jpeg";
}

function format_date(dt_obj) {
    var month = '' + (dt_obj.getMonth() + 1),
        day = '' + dt_obj.getDate(),
        year = dt_obj.getFullYear();
    (month.length < 2) ? month = '0' + month: false;
    (day.length < 2) ? day = '0' + day: false;
    return [year, month, day].join('-');
}

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
    if((document.location.hash).replace(/#/g,"") != page){
        $('#main_container').empty().html('<img style="margin-top:45vh" src="images/loading.gif" alt="Loading" />');    
        document.location.hash = page;
    }
}

window.onhashchange = function() {
    var link = (document.location.hash).replace(/#/g,"");
    (link != "") ? navigator(link) : false;
}


function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}


var type = 'POST';
var params = {'api':'get_questions'};
var q_types = {"1":"Objective","2":"descriptive"};
var all_questions =  JSON.parse(requester(url,type,params));
// console.log(all_questions);
// var all_questions =  
// {
//     "1":{
//         "desc": "Why do you want to be a teacher with Kido Village?",
//         "type": 1,
//         "is_required": 1,
//         "options": {
//             "1":"Convenience of working from home!",
//             "2":"Love for teaching!",
//             "3":"Want to work with a Global Brand?",
//             "4":"Alternative stream of income!",
//         },
//     },
//     "2":{
//         "desc": "Why Kido Village?",
//         "type": 2,
//         "is_required": 0,
//         "options": {},
//     }
// }
local_set('questions',all_questions);
function update_home() {
    var questions = local_get('questions');
    var q_card_def = $('.q_card:first');
    $('#question_div').empty();

    // console.log(questions);

    $.each(questions, function (k, v) {

        var q_card  = q_card_def.clone();
        
        q_card.find('.q_desc').text(v.question);
        q_card.attr('q_id',k);
        q_card.attr('q_type',v.type);
        // console.log(v.question);

        var opts = "";

        if(v.type == 1){

            $.each(v.options, function (k1, v1) {

                opts += '<li><input type="radio" name="'+k+'" value="'+k1+'">'+v1+'</li>';

            });

            q_card.find('.q_opts').html(opts);
        }else{
            opts += '<li><input type="text" placeholder="Your Answer" name="'+k+'" value="" /></li>';
        }

        q_card.find('.q_opts').html(opts);

        $('#question_div').append(q_card);
    });
}


function init_answers() {
    // var questions = local_get('questions');
    // var q_card_def = local_set('q_card_def',$('.q_card:first').html());
    // $('#question_div').empty();
}


function update_answers() {
    var questions = local_get('questions');
    var q_card_def = $('.q_card:first').css("display","block");
    $('#question_div').empty();
    var params = {'api':'get_user_answers','user_email':$('#user_ans_inp').val()};
    var answers =  key_mapper(JSON.parse(requester(url,type,params)),'question_id');
    // console.log(answers);
    if (Object.keys(answers).length){
        $.each(questions, function (k, v) {
            var q_card  = q_card_def.clone();
            q_card.find('.q_desc').text(v.question);
            q_card.attr('q_id',k);
            q_card.attr('q_type',v.type);
            // console.log(v.question);
            var opts = "";
            if(v.type == 1){
                $.each(v.options, function (k1, v1) {
                    var is_checked = "";
                    if(answers[k]['selected_option']){
                        (answers[k]['selected_option'] == k1) ? is_checked =  "checked" : false;
                    }
                    opts += '<li><input disabled '+is_checked+' type="radio" name="'+k+'" value="'+k1+'">'+v1+'</li>';
                });
                q_card.find('.q_opts').html(opts);
            }else{
                var usr_ans = (answers[k]['long_answer']) ? answers[k]['long_answer'] : "";
                opts += '<li><input type="text" disabled placeholder="Your Answer" name="'+k+'" value="'+usr_ans+'" /></li>';
            }
            q_card.find('.q_opts').html(opts);
            $('#question_div').append(q_card);
        });
    }else{
        alert("User not found");
    }
}

function key_mapper(arr,ind) {
    var fin = {};
    $.each(arr, function (k1, v1) {
        fin[v1[ind]] = v1;
    });
    return fin;
}


$(document).ready(function() {
    // window.addEventListener('load', function() {
        // navto('admin');
        // logout();
        clearInterval();
        // navto('product');
        var page = (document.location.hash).replace(/#/g,"");
        if(page.length){
            navigator(page);
        }else{
            navto('home');
        }
        // navto('cart');
        // navto('item');
    
        // function playAudio() {
        // }
        
        // document.location.hash = "";
        // navto('cart');
    // });
});

$(document).on('click','#get_answer',function(){

    update_answers();
    // var params = {'user_email':$('#user_ans_inp').val(),'api':'get_user_answers'};
    // var user_answers =  JSON.parse(requester(url,"POST",params));

    // console.log(user_answers);
    

});


$(document).on('click','#submit_answer',function(){

    var tester = "";
    var all_answered = true;
    var user_answers = {};

    $(".q_card").each(function() {
            var qname = $(this).attr("q_id") ;
            var answer = null;
            var q_type = $(this).attr("q_type");
            if(q_type == 1){
                answer = $('input[name='+qname+']:checked').val();
            }else{
                answer = $('input[name='+qname+']').val();
            }
            !answer ?  all_answered = false : false;

            user_answers[qname] = {};

            user_answers[qname]['answer'] = answer;
            user_answers[qname]['type'] = q_type;
    });

    !all_answered ?  tester += " Please answer all questions. " : false;

    !isEmail($("#email_inp").val())  ? tester +=" Please entre valid Email" : false;

    // console.log(user_answers);

    // local_set("temp_answers",user_answers);

    // var ord = requester(url,"POST",{'api':'update_lead','user_email':$('#email_inp').val(),"user_answers":user_answers});
    // // console.log((JSON.parse(ord)[0].ProspectStage));
    // if((JSON.parse(ord)[0].ProspectStage)){

    // }

    // alert((JSON.parse(ord)[0].ProspectStage));

    if(tester.length == 0){
        // var ord = requester(url,"POST",{'api':'update_lead','user_email':$('#email_inp').val()});
        var result = requester(url,"POST",{'api':'save_user_answers','user_email':$('#email_inp').val(),'user_answers':user_answers});
        var res  = JSON.parse(result);
        alert(res["msg"]);location.reload();

        // console.log(ord);
        // alert()
    }else{
        alert(tester);
    }

});


function logout() {
    localStorage.clear();
    location.reload();
}
