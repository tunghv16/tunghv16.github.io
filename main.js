const socket = io('https://tunghv16-web-rtc.herokuapp.com/');
$('#div-chat').hide();

socket.on('listOnline', function (data) {
    $('#div-chat').show();
    $('#div-register').hide();
    
    data.forEach(function (user) {
        const {ten, peerId} = user;
        $('.list-user').append(
            `<li class="mb-2" id="${ peerId }">${ ten }
            <button class="btn btn-danger">
            <i class="fa fa-phone text-success"></i>
            </button>
            </li>`
        );
    });
    
    socket.on('newUserLogin', function (u) {
        const {ten, peerId} = u;
        $('.list-user').append(
            `<li class="mb-2" id="${ peerId }">${ ten }
            <button class="btn btn-danger">
            <i class="fa fa-phone text-success"></i>
            </button>
            </li>`
        );
    });
    
    socket.on('userDisconnect', function (peerId) {
        $(`#${ peerId }`).remove();
    })
});

socket.on('failed', function () {
    alert('Tên này đã được sử dụng. Vui lòng đăng ký tên khác!!!');
});

socket.on('disabledCallUser', function (data) {
    $(`#${ data.caller }`).find('button').hide();
    $(`#${ data.callee }`).find('button').hide();
});

$('.list-user').on('click', 'li', function () {
    let peerId = $(this).attr('id');
    socket.emit('userCall', peerId);
    openStream().then(function (strem) {
        playStream('localStream', strem);
        const call = peer.call(peerId, strem);
        call.on('stream', function (remoteStream) {
            playStream('remoteStream', remoteStream);
        })
    })
});

function openStream() {
    const config = {audio : true, video : true};
    
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video     = document.getElementById(idVideoTag);
    video.srcObject = stream;
    let playPromise = video.play();
    
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Automatic playback started!
            // Show playing UI.
            // We can now safely pause video...
            video.reload();
        })
            .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
            });
    }
}

// openStream().then(stream => playStream('localStream', stream));

const peer = new Peer({key : 'lwjd5qra8257b9'});

peer.on('open', function (id) {
    $('#my-peer').append(id);
    
    $('#btnSignUp').on('click', function () {
        let userName = $('#txtUserName').val();
        
        socket.emit('register', {ten : userName, peerId : id});
    });
    
    $('.close-call').on('click',function () {
        console.log('xxxx');
        peer.on('close', function() {
            peer.destroy();
        });
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
peer.on('call', function (call) {
    openStream().then(function (stream) {
        call.answer(stream); // Answer the call with an A/V stream.
        
        playStream('localStream', stream);
        
        call.on('stream', function (remoteStream) {
            playStream('remoteStream', remoteStream);
        });
    })
});

