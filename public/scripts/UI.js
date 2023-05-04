const GG = new Audio('assets/audio/Gameover.wav');
const BGM = new Audio('assets/audio/Background.mp3');
BGM.volume = 0.6;

const SignInForm = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $('#signin-overlay').hide();

        // Submit event for the signin form
        $('#signin-form').on('submit', (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $('#signin-username').val().trim();
            const password = $('#signin-password').val().trim();

            // Send a signin request
            Authentication.signin(
                username,
                password,
                () => {
                    hide();
                    // UserPanel.update(Authentication.getUser());
                    // UserPanel.show();
                },
                (error) => {
                    $('#signin-message').text(error);
                }
            );
        });

        // Submit event for the register form
        $('#register-form').on('submit', (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $('#register-username').val().trim();
            const name = $('#register-name').val().trim();
            const password = $('#register-password').val().trim();
            const confirmPassword = $('#register-confirm').val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $('#register-message').text('Passwords do not match.');
                return;
            }

            // Send a register request
            Registration.register(
                username,
                name,
                password,
                () => {
                    $('#register-form').get(0).reset();
                    $('#register-message').text('You can sign in now.');
                },
                (error) => {
                    $('#register-message').text(error);
                }
            );
        });
    };

    // This function shows the form
    const show = function () {
        $('#signin-overlay').fadeIn(500);
    };

    // This function hides the form
    const hide = function () {
        $('#signin-form').get(0).reset();
        $('#signin-message').text('');
        $('#register-message').text('');
        $('#signin-overlay').fadeOut(500);
        BGM.currentTime = 0;
        BGM.play();
    };

    return { initialize, show, hide };
})();

// control UI relevant to game menu
const gameMenu = (function () {
    const signout = function () {
        BGM.pause();
        // Send a signout request
        Authentication.signout(() => {
            SignInForm.show();
        });
    };
    return { signout };
})();

// control UI relevant to game statistics
const gameStat = (function () {
    const enterStat = function () {
        $('#table-body').empty();

        // list for holding the ranking
        const stat_list = [];

        fetch('/statistic_board')
            .then((response) => response.json())
            .then((json) => {
                if (json.status == 'success') {
                    // don't know why i need to do that??
                    const statistics = JSON.parse(json.stat);

                    for (const username in statistics) {
                        let stat = { username: username, ...statistics[username] };
                        stat_list.push(stat);
                    }
                    stat_list.sort((a, b) => b.win - a.win);

                    for (let i = 0; i < stat_list.length; i++) {
                        let no = i + 1;
                        const rank = $('<tr></tr>')
                            .append($('<td>' + no + '</td>'))
                            .append($('<td>' + stat_list[i].username + '</td>'))
                            .append($('<td>' + stat_list[i].win + '</td>'))
                            .append($('<td>' + stat_list[i].loss + '</td>'));

                        $('#table-body').append(rank);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });

        $('#menu').hide();
        $('#ranking').show();
    };

    const backToMenu = function () {
        $('#ranking').hide();
        $('#menu').show();
    };
    return { enterStat, backToMenu };
})();

// control UI relevant to game over page
const gameOver = (function (win) {
    const enterGameOver = function () {
        BGM.pause();
        GG.currentTime = 0;
        GG.play();
        $('#clock').hide();
        $('#game-over').show();
    };

    const backToMenu = function () {
        GG.pause();
        $('#game-over').hide();
        $('#menu').show();
        $('#canvas').css('background-image', "url('./assets/gameBackground.png')").css('background-color', 'none');
        // remember to clear screen!
        const canvas = $('canvas').get(0);
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    return { enterGameOver, backToMenu };
})();

// control UI relevant to game info page
const gameInfo = (function () {
    const enterGameInfo = function () {
        $('#menu').hide();
        $('#game-info').show();
    };

    const backToMenu = function () {
        $('#game-info').hide();
        $('#menu').show();
    };

    return { enterGameInfo, backToMenu };
})();
