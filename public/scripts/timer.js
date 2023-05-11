const Timer = function(time) {
    const orgTime = time;
    let time_remaining = orgTime;
    let countdown = null;

    const startCountDown = ()=>{
        $("#timer").text(`There are ${time_remaining} seconds left!`);
        countdown = setInterval(() => {
            $("#timer").text(`There are ${time_remaining} seconds left!`);
            time_remaining -= 1;
            if (time_remaining < 0) {
              clearInterval(countdown);
              $("#timer").text(`Time's UP!`);
              socket.emit("Time's Up");
              timerreset();
            }
          }, 1000);
    }

    const timerreset = ()=>{
      clearInterval(countdown);
      console.log("timer reset")
      time_remaining = orgTime;
    }

    return {startCountDown:startCountDown,timerreset:timerreset};


}