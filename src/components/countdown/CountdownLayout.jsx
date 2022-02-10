import React from 'react';
import moment from 'moment';

const CountdownLayout = ({ countdown, unixEndDate, showEndDate }) => {

  return (
    <div className="imported-countdown">
      <div className="countdown">
        <div className="card">
          <div className="countdown-value">{countdown.days}</div>
          <div className="countdown-unit">Days</div>
        </div>
        <div className="card">
          <div className="countdown-value">{countdown.hours}</div>
          <div className="countdown-unit">Hours</div>
        </div>
        <div className="card">
          <div className="countdown-value">{countdown.mins}</div>
          <div className="countdown-unit">Mins</div>
        </div>
        <div className="card">
          <div className="countdown-value">{countdown.secs}</div>
          <div className="countdown-unit">Secs</div>
        </div>
        {(showEndDate? <p>Counting down to {moment.unix(unixEndDate).format('dddd, MMMM Do, YYYY | h:mm A')}</p> : null)}
      </div>

    </div>
  );
}

export default CountdownLayout;
