const socket = io('https://tunghv16-web-rtc.herokuapp.com/');
$('#div-chat').hide();

socket.on('listOnline', function (data) {
    $('#div-chat').show();
    $('#div-register').hide();
    data.forEach(function (user) {
        const { ten, peerId } = user;
        $('.list-user').append(`<li id="${peerId}">${ten}</li>`);
    });
    
    socket.on('co_nguoi_moi', function (u) {
        const { ten, peerId } = u;
        $('.list-user').append(`<li id="${peerId}">${ten}</li>`);
    });
    
    socket.on('user_disconnect', function (peerId) {
        $(`#${peerId}`).remove();
    })
});

socket.on('failed', function () {
   alert('Da co nguoi dang ky ten nay roi');
});

$('.list-user').on('click', 'li', function () {
    let peerId = $(this).attr('id');
    openStream().then(function (strem) {
        playStream('localStream', strem);
        const call = peer.call(peerId, strem);
        call.on('stream', function (remoteStream) {
            playStream('remoteStream', remoteStream);
        })
    })
});

function openStream() {
    const config = { audio: true, video: true };
    
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
     video.srcObject = stream;
     video.play();
}

// openStream().then(stream => playStream('localStream', stream));

const peer = new Peer({key: 'lwjd5qra8257b9'});

peer.on('open', function(id) {
    $('#my-peer').append(id);
    
    $('#btnSignUp').on('click', function () {
        let userName = $('#txtUserName').val();
        
        socket.emit('register', { ten:userName, peerId:id });
    });
});

// caller
$('#btn-call').on('click', function () {
    const id = $('#remote-id').val();
    openStream().then(function (strem) {
        playStream('localStream', strem);
        const call = peer.call(id, strem);
        call.on('stream', function (remoteStream) {
            playStream('remoteStream', remoteStream);
        })
    })
});

// callee
peer.on('call', function(call) {
    openStream().then(function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        playStream('localStream', stream);
        call.on('stream', function(remoteStream) {
            playStream('remoteStream', remoteStream);
        });
    })
});

