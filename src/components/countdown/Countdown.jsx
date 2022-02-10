import React from 'react';
import moment from 'moment';
import CountdownLayout from './CountdownLayout';

// interface State {
//   dateValue: string;
//   timeValue: string;
//   ampmValue: string;

//   countdown: CountdownState;
//   isCountdownSet: boolean;
//   infoMessage: string;
//   settingsFormError: boolean;
//   errorMessage: string;
// }
// interface CountdownState {
//   days: string;
//   hours: string;
//   mins: string;
//   secs: string;
// }



class Countdown extends React.Component {
  // timer: number | undefined;
  // countDownDate: {[key: string] : string};

  constructor(props) { // {target} must be a number, unix timestamp
    super(props);
    this.state = {
      dateValue: '',
      timeValue: '',
      ampmValue: 'am',
      countdown: {
        days: '',
        hours: '',
        mins: '',
        secs: ''
      },
      isCountdownSet: true,
      infoMessage: '',
      settingsFormError: false,
      errorMessage: ''
    };
    this.timer = null;
    this.countDownDate = {
      dateValue: this.state.dateValue,
      timeValue: this.state.timeValue,
      ampmValue: this.state.ampmValue,
      unixEndDate: props.target,
    }; 
    this.showEndDate = props.showEndDate;
  }

  renderCountdownDate(countDownDate) {
    if (countDownDate != null) {
      localStorage.setItem('countDownDate', JSON.stringify(countDownDate))
    }
    return JSON.parse(localStorage.getItem('countDownDate')) || this.countDownDate;
  }

  startCountdown(endDate) {
    clearInterval(this.timer);
    this.timer = undefined;

    if (endDate.unixEndDate !== '') {
      this.playTimer(endDate.unixEndDate); // also updating now to avoid UI rendering delays
      this.timer = window.setInterval(() => this.playTimer(endDate.unixEndDate), 1000);
    }
    else {
      this.setState({
        isCountdownSet: false,
        infoMessage: 'Click the Settings button to start a new countdown.'
      });
    }
  }

  playTimer(unixEndDate) {
    // const unixEndDate = Number(moment(`${dateValue} ${timeValue} ${ampmValue}`, 'MM-DD-YYYY hh:mm A').format('X'));
    const distance = unixEndDate - moment().format('X');

    if (distance >= 0) {
      this.setState({
        countdown: {
          days: parseInt(distance / (60 * 60 * 24), 10),
          hours: parseInt(distance % (60 * 60 * 24) / (60 * 60), 10),
          mins: parseInt(distance % (60 * 60) / (60), 10),
          secs: parseInt(distance % 60, 10)
        },
        isCountdownSet: true,
        infoMessage: ''
      });
    }
    else {
      clearInterval(this.timer);
      this.timer = null;
      this.renderCountdownDate(this.countDownDate);
      this.setState({
        isCountdownSet: false,
        infoMessage: 'Countdown ended. Click the Settings button to start a new countdown.'
      });
    }
  }

  clearCountdown() {

    if (this.renderCountdownDate().unixEndDate !== '') {
      clearInterval(this.timer);
      this.timer = null;
      this.setState({
        isCountdownSet: false,
        infoMessage: 'Countdown cleared. Click the Settings button to start a new countdown.',
      });
      this.renderCountdownDate(this.countDownDate);
    }
    else {
      alert('No countdown has been set. Please click the Settings button to start a new countdown.');
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  componentDidMount() {
    this.startCountdown(this.renderCountdownDate());
  }

  render() {
    return (
      <CountdownLayout showEndDate={this.showEndDate} countdown={this.state.countdown} unixEndDate={this.renderCountdownDate().unixEndDate} />
    );
  }
}

export default Countdown;
