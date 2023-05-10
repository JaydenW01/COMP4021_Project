const Timer = function(time) {
    let time_remaining = time;

    const startCountDown = ()=>{
        $("#timer").text(`There are ${time_remaining} seconds left!`);
        const countdown = setInterval(() => {
            $("#timer").text(`There are ${time_remaining} seconds left!`);
            time_remaining -= 1;
            if (time_remaining < 0) {
              clearInterval(countdown);
              $("#timer").text(`Time's UP!`);
              socket.emit("Time's Up");
            }
          }, 1000);
    }

    return {startCountDown:startCountDown};


}