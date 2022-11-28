import React, { useEffect, useState } from 'react';
import formatDuration from 'format-duration';

function Timer(props) {
   
    const [current, setCurrent] = useState(props.gameStart);

    useEffect(() => {
        const interval = setInterval(() => setCurrent(Date.now()), 1000);
        return () => clearInterval(interval);
      }, []);

    let elapsed = formatDuration(current - props.gameStart);
    return <div>Time Elapsed: {elapsed}</div>;
}

export default Timer;