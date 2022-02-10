/* global jQuery*/
import { plus_days } from "./ConversionUtil";
import { trackClick } from "./AnalyticsUtil";

const TIMESHEET_INTERVAL = 15; // in minutes
const elite_booking_min_duration = 45; // minutes

export function initAvailabilityTimeSheet(responseBookings, availabilityResponse, start_week, 
  
  scheduleSelection, 
  scriptLoadDate, 
  onScheduleSelectionChange,
  horasAnticipacion,
  fecha_caducidad_horario,

    ) {
  if (start_week == null) {
      start_week = scriptLoadDate;
  }

  // buttons logic
  if (start_week <= scriptLoadDate) {
      jQuery(".elitePreviousWeek").attr('disabled', true).animate({opacity:0});
  } else {
      jQuery(".elitePreviousWeek").removeAttr('disabled').animate({opacity:1});
  }

  // checking that we have the required data
  if (availabilityResponse == null || responseBookings == null) {
      console.log("There is no availabilityResponse or responseBookings yet");
      return;
  }

  const dataFillResult = getDataToFillAndWorkWithSheet(
    start_week,
    responseBookings, 
    availabilityResponse, 
    scheduleSelection,
    
    horasAnticipacion,
    fecha_caducidad_horario,
    
    );
  
  if (dataFillResult == null) { // no hay horarios disponibles
    return;
  }

  const {reference_data, sheetData, hourList, dayList, dimensions, sheetText} = dataFillResult;

  var updateRemark = function (sheet, dimensions) {

      var sheetStates = sheet.getSheetStates();
      var rowsCount = dimensions[0];
      var colsCount = dimensions[1];
      var rowRemark = [];
      var rowRemarkLen = 0;
      var remarkHTML = '';

      for (var row = 0, rowStates = []; row < rowsCount; ++row) {
          rowRemark = [];
          rowStates = sheetStates[row];
          for (var col = 0; col < colsCount; ++col) {
              if (rowStates[col] === 0 && rowStates[col - 1] === 1) {
                  rowRemark[rowRemarkLen - 1] += (col <= 10 ? '0' : '') + col + ':00';
              } else if (rowStates[col] === 1 && 
                  (rowStates[col - 1] === 0 || rowStates[col - 1] === undefined)) {
                  rowRemarkLen = rowRemark.push((col <= 10 ? '0' : '') + col + ':00-');
              }
              if (rowStates[col] === 1 && col === colsCount - 1) {
                  rowRemark[rowRemarkLen - 1] += '00:00';
              }
          }
          remarkHTML = rowRemark.join("，");
          sheet.setRemark(row, remarkHTML === '' ? sheet.getDefaultRemark() : remarkHTML);
      }
  };

  jQuery("#availability").html('');
  var sheet = jQuery("#availability").TimeSheet({
      data: {
          dimensions: dimensions,
          colHead: dayList,
          rowHead: hourList,
          sheetHead: { name: "" },
          sheetData: sheetData,
          sheetText: sheetText,
      },
      remarks: false,
      start: function (ev, selectedArea) {
          sheet.clean();
      },
      end: function (ev, selectedArea) {
          // in this moment the sheet is already painted with the last selection


          // next are according to the timesheet (not necessarily starting at monday)
          // var row = Number(ev.target.dataset['row']);
          // var col = Number(ev.target.dataset['col']);
          const row = selectedArea.topLeft[0];
          const rowEnd = selectedArea.bottomRight[0];
          const col = selectedArea.topLeft[1];
          const colEnd = selectedArea.bottomRight[1];

          // se probó aquí que los valores de selectedArea son correctos en safari (IOS)

          if (row == rowEnd && col == colEnd && sheetData[row][col] == 1) {        
              trackClick("sched_sel_end_delete");
              
              let rowIt;
              rowIt = row;
              while (rowIt < sheetData.length // making sure it is not outside the table
                  && [1].includes(sheetData[rowIt][col])
                  ) {
                  sheetData[rowIt][col] = 0;
                  rowIt++;
              }
              
              rowIt = row - 1;
              while (rowIt >= 0  // making sure it is not outside the table
                  && [1].includes(sheetData[rowIt][col])
                  ) {
                  sheetData[rowIt][col] = 0;
                  rowIt--;
              }

              scheduleSelection = getBookingIntervalsForSheetData(sheetData, reference_data, scheduleSelection);

          } else {
              let minNumberOfBlocksPerInterval = 3; // minimum number of blocks to paint per interval
              const coversDifferentColumns = selectedArea.topLeft[1] != selectedArea.bottomRight[1];

              let newRowEnd = rowEnd;
              let newRowStart = row;

              // if there is a selection upwards already
              while (newRowEnd - newRowStart + 1 < minNumberOfBlocksPerInterval 
                  && newRowStart - 1 >= 0  // making sure it is not outside the table
                  && [1].includes(sheetData[newRowStart - 1][col])
                  ) {
                  newRowStart--;
              }

              // if user has selected less than the minimum of blocks and there are blocks
              // available after the selection, then select until completion
              while (newRowEnd - newRowStart + 1 < minNumberOfBlocksPerInterval 
                  && newRowEnd + 1 < sheetData.length // making sure it is not outside the table
                  && [2, 1].includes(sheetData[newRowEnd + 1][col])
                  ) {
                  newRowEnd++;
              }
              
              // if user has selected less than the minimum of blocks and there are blocks
              // available before the selection, then select until completion
              while (newRowEnd - newRowStart + 1 < minNumberOfBlocksPerInterval 
                  && newRowStart - 1 >= 0  // making sure it is not outside the table
                  && [2, 1].includes(sheetData[newRowStart - 1][col])
                  ) {
                  newRowStart--;
              }

              // checking if block is available (state = 2 or 1) (2: blue, 1: purple)
              let blocksAvailable = true;
              for (let myRow = newRowStart; myRow <= newRowEnd; myRow++) {
                  if (myRow < sheetData.length) {
                      const cellState = sheetData[myRow][col];
                      if (cellState != 2 && cellState != 1) {
                          blocksAvailable = false;
                          break;
                      }
                  } else {
                      blocksAvailable = false;
                      break;
                  }
              }

              /////
              // at this point newRowStart and newRowEnd have the start and end of the selected interval
              /////

              const verticalBlocks = newRowEnd - newRowStart + 1;
              // const balanceToBeBeforeBooking = Number(jQuery("#balanceToBe").val()); // balance anterior + duracion del plan que ha escogido
              

              // sum all the duration of all in selectedSched...
              for (let myRow = newRowStart; myRow <= newRowEnd; myRow++) {
                  sheetData[myRow][col] = 1;
              }
              const possibleSelection = getBookingIntervalsForSheetData(sheetData, reference_data, scheduleSelection);
              // let durationSum = possibleSelection.map((a) => a['end_time'] - a['start_time']).reduce((a, b) => a + b, 0);
              // const enoughBalance = true; // balanceToBeBeforeBooking >= durationSum;


              // reference_data follows the same indexing as timesheet row and col
              const start_time = Number(reference_data[newRowStart][col]['start_time']);
              const booking_date = reference_data[newRowStart][col]['booking_date'];

              const now = Date.now(); // timestamp in millis
              
              const minTimestamp = now + horasAnticipacion * 3600 * 1000;

              const minutesFromDayToTs = minutesFromDayToTimestamp(start_time, booking_date); // inicio del intervalo que está tratando de seleccionar

              // alert([start_time, booking_date, minutesFromDayToTs, minTimestamp]);
              // en IOS el minutesFromDay... es NaN (Not A Number), así:
                  // Chrome: 420,2020-11-18,1605700800000,1605691060488
                  // IOS: 420,2020-11-18,NaN,1605691060488

              const tieneSuficienteAnticipacion = minutesFromDayToTs > minTimestamp;

              if (
                  verticalBlocks >= minNumberOfBlocksPerInterval // checking for the minimum block amount
                  && blocksAvailable 
                  && !coversDifferentColumns
                  // && enoughBalance
                  && tieneSuficienteAnticipacion
              ) {
                  trackClick("sched_sel_end_valid");
                  
                  for (let myRow = newRowStart; myRow <= newRowEnd; myRow++) {
                      sheetData[myRow][col] = 1;
                  }
                  scheduleSelection = getBookingIntervalsForSheetData(sheetData, reference_data, scheduleSelection);
              } else {
                  trackClick("sched_sel_end_invalid");

                  if (coversDifferentColumns) {
                      ;
                  } else if (!blocksAvailable) {
                      ;
                  } else if (!tieneSuficienteAnticipacion) {
                      const fDate = new Date(minTimestamp);
                      alert("No es posible reservar antes de las " + fDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) + " 😉");
                  } 
                  // else if (!enoughBalance) {
                  //     alert("No tienes suficiente cobertura, solo puedes seleccionar hasta " + balanceToBeBeforeBooking + " minutos");
                  // }
              }
          }

          onScheduleSelectionChange(scheduleSelection);

          initAvailabilityTimeSheet(
            responseBookings, availabilityResponse, start_week,
            
  scheduleSelection, 
  scriptLoadDate, 
  onScheduleSelectionChange,
  horasAnticipacion,
  fecha_caducidad_horario,
            );
      }
  });

  if (start_week <= scriptLoadDate) {
      jQuery(".TimeSheet-colHead[data-col=0] span").addClass("today");
  } else {
      jQuery(".TimeSheet-colHead[data-col=0] span").removeClass("today");
  }

  updateRemark(sheet, dimensions);
}

/**
 * Returns the data to fill a table for a given week, it needs the availability and other bookings for this tutor.
 * It also needs the whole schedule selection
 */
 function getDataToFillAndWorkWithSheet(start_week, responseBookings, availabilityResponse, 
  scheduleSelection,

  horasAnticipacion,
  fecha_caducidad_horario,
  
  ) {
  var dimensions = [24 * 60 / TIMESHEET_INTERVAL, 7];

    var weekday = new Array(7);
    weekday[0] = "Dom";
    weekday[1] = "Lun";
    weekday[2] = "Mar";
    weekday[3] = "Mie";
    weekday[4] = "Jue";
    weekday[5] = "Vie";
    weekday[6] = "Sab";
    var dayList = [
        { name: "<span class='day_in_month'>" + start_week.getDate() + "</span><br><span class='day_of_week'>" + weekday[start_week.getDay()] + "</span>", title: "", },
        { name: "<span class='day_in_month'>" + plus_days(start_week, 1).getDate() + "</span><br><span class='day_of_week'>" + weekday[plus_days(start_week, 1).getDay()] + "</span>", title: "", },
        { name: "<span class='day_in_month'>" + plus_days(start_week, 2).getDate() + "</span><br><span class='day_of_week'>" + weekday[plus_days(start_week, 2).getDay()] + "</span>", title: "" },
        { name: "<span class='day_in_month'>" + plus_days(start_week, 3).getDate() + "</span><br><span class='day_of_week'>" + weekday[plus_days(start_week, 3).getDay()] + "</span>", title: "" },
        { name: "<span class='day_in_month'>" + plus_days(start_week, 4).getDate() + "</span><br><span class='day_of_week'>" + weekday[plus_days(start_week, 4).getDay()] + "</span>", title: "" },
        { name: "<span class='day_in_month'>" + plus_days(start_week, 5).getDate() + "</span><br><span class='day_of_week'>" + weekday[plus_days(start_week, 5).getDay()] + "</span>", title: "" },
        { name: "<span class='day_in_month'>" + plus_days(start_week, 6).getDate() + "</span><br><span class='day_of_week'>" + weekday[plus_days(start_week, 6).getDay()] + "</span>", title: "" }
    ];

    var hourList = [];
    var reference_hour = [];
    var start_minute = 0;
    for (var i = 0; i < 24 * 60 / TIMESHEET_INTERVAL; i++) {
        reference_hour[start_minute] = i;

        var timeTitle = pad(Math.floor(start_minute / 60), 2) + ":" + pad(start_minute % 60, 2);
        var timeTitleStart = timeTitle;
        var timeTitleEnd = pad(Math.floor((start_minute + TIMESHEET_INTERVAL) / 60, 2)) + ":" + pad((start_minute + TIMESHEET_INTERVAL) % 60, 2);
        if (i % 2 == 1) {
            timeTitle = "&nbsp;";
        }
        hourList.push({ name: "<span class='width-10'>" + timeTitle + "</span>", title: timeTitleStart + "-" + timeTitleEnd });
        start_minute += TIMESHEET_INTERVAL;
    }
    var reference_day_of_week = [];
    for (let myDay = 0; myDay < 7; myDay++) {
        reference_day_of_week[myDay] = (myDay - start_week.getDay() + 7)%7;
    }

    var sheetData = [];
    var sheetText = [];
    var reference_data = [];
    var start_minute = 0;
    for (let i = 0; i < 24 * 60 / TIMESHEET_INTERVAL; i++) {
        sheetData.push([0, 0, 0, 0, 0, 0, 0]);
        sheetText.push(['', '', '', '', '', '', '']);
        reference_data.push(
            [
                { booking_date: plus_days(start_week, 0).getFullYear() + "-" + leftPad(plus_days(start_week, 0).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 0).getDate(), 2), start_time: start_minute },
                { booking_date: plus_days(start_week, 1).getFullYear() + "-" + leftPad(plus_days(start_week, 1).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 1).getDate(), 2), start_time: start_minute },
                { booking_date: plus_days(start_week, 2).getFullYear() + "-" + leftPad(plus_days(start_week, 2).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 2).getDate(), 2), start_time: start_minute },
                { booking_date: plus_days(start_week, 3).getFullYear() + "-" + leftPad(plus_days(start_week, 3).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 3).getDate(), 2), start_time: start_minute },
                { booking_date: plus_days(start_week, 4).getFullYear() + "-" + leftPad(plus_days(start_week, 4).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 4).getDate(), 2), start_time: start_minute },
                { booking_date: plus_days(start_week, 5).getFullYear() + "-" + leftPad(plus_days(start_week, 5).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 5).getDate(), 2), start_time: start_minute },
                { booking_date: plus_days(start_week, 6).getFullYear() + "-" + leftPad(plus_days(start_week, 6).getMonth() + 1, 2) + "-" + leftPad(plus_days(start_week, 6).getDate(), 2), start_time: start_minute },

            ]
        );
        start_minute += TIMESHEET_INTERVAL;
    }
    var start_time = 0;

    function processSpecificIntervals(response, applyBreath, cellStatus, setIntervalTitle = false) {
        var sheetNrow = sheetData.length;
    
        var pick_date = [];
        for (var i = 0; i < response.length; i++) {
            var x = reference_day_of_week[response[i]['weekday']];
            var y = reference_hour[response[i]['start_time']];
            const endY = reference_hour[response[i]['end_time']];

            // cuando asignamos cobertura se suele crear una reserva de duración cero, debemos excluirlas
            const bookingDuration = response[i]['end_time'] - response[i]['start_time']; // in minutes
            if (bookingDuration == 0) continue;

            if (reference_data[y][x]['booking_date'] == response[i]['pick_date']) { // check if the date matches this week's day
              if (setIntervalTitle) {
                  sheetText[y][x] = 
                      convert_minutes_to_time(response[i]['start_time']);
                  sheetText[endY - 1][x] = 
                      convert_minutes_to_time(response[i]['end_time']);
              }

              const y_original = y;

              for (; y < endY; y++) {
                  pick_date.push({ row: y, col: x });
              }

              if (applyBreath) {
                  // breath (respiro) para el profesor entre reserva y reserva
                  // si se modifica esto también modificar el comprobador de intersecciones en save_booking
                  if (y < sheetNrow) {
                      pick_date.push({ row: y, col: x });
                  }

                  if (y_original - 1 >= 0) {
                      pick_date.push({ row: y_original - 1, col: x });
                  }
  
              }
            }
        }

        if (cellStatus == null) {
          cellStatus = 3;
        }

        for (var i = 0; i < pick_date.length; i++) {
          sheetData[pick_date[i]['row']][pick_date[i]['col']] = cellStatus;
        }
    }

    function processAvailability(response) {
        for (var i = 0; i < response.length; i++) {
            var x = reference_day_of_week[response[i]['weekday']];
            
            for (var y = reference_hour[response[i]['start_time']]; 
            y < reference_hour[response[i]['end_time']]; y++) {
              const date = reference_data[y][x]['booking_date']; // es la fecha que estamos analizando (cadena)

                // las filas son la horas (o intervalos de tiempo) y las columnas son el día
                // la "y" representa la hora y la "x" el día
                if (date <= fecha_caducidad_horario) {
                    // Añadir la condición de que dependiendo del "y"
                    // y de si es la fecha actual se considere la anticipación

                    // no asignar el valor 2 cuando se cumplan las sgtes 2 condiciones:
                    // * La fecha (date) es igual a la fecha actual y 
                    // * el "y" es menor que now + anticipación (revisr como hacer esto)

                    // ó alternativamente a hacer esas 2 condiciones:
                    // hallar el timestamp de inicio de esta hora (cuadradito)
                    // y compararlo con el minTimestamp (ver abajo)
                    const now = Date.now(); // timestamp in millis
                    const minTimestamp = now + horasAnticipacion * 3600 * 1000;
                    
                    // para obtener el timestamp de inicio de esta hora usar minutesFromDayToTimestamp
                    const minutesFromDayToTs = minutesFromDayToTimestamp(y * TIMESHEET_INTERVAL, date); // no estoy seguro si es 15 o 45, tampoco de si es "y" o "y + 1"

                    if (minTimestamp > minutesFromDayToTs) {
                        ;
                    } else {
                      sheetData[y][x] = 2;
                    }
                }
            }
        }
    }


    // lee el horario (availability) del profe y 
    // modifica sheetData de acuerdo al horario
    // asignando el valor 2 a las celdas que serán azules
    processAvailability(availabilityResponse);

    // past bookings (from this or other user)
    processSpecificIntervals(responseBookings, true);

    function purgeUnusableIntervals() {
      // removing unusable intervals (blocks of less than elite_booking_min_duration: 45 minutes)
      const minContinousBlockAllowed = Math.ceil(elite_booking_min_duration / TIMESHEET_INTERVAL);
      const sheetNrow = sheetData.length;
      const sheetNcol = sheetData[0].length;
      const clearValue = 0;
      for (let i = 0; i < sheetNcol; i++) {
          let continuous = 0;
          for (let j = 0; j < sheetNrow; j++) {
              const st = sheetData[j][i];
              if (st == 2) { // available
                  continuous++;
              } else { // cut
                  if (continuous < minContinousBlockAllowed) {
                      // clearing unusable interval
                      for (let k = j - continuous; k < j; k++) {
                          sheetData[k][i] = clearValue;
                      }
                  }
                  continuous = 0;
              }
          }
          if (continuous < minContinousBlockAllowed) {
              // clearing unusable interval
              for (let k = sheetNrow - continuous; k < sheetNrow; k++) {
                  sheetData[k][i] = clearValue;
              }
          }
      }
    }

    // debe hacerse esto antes de procesar la selección del usuario
    purgeUnusableIntervals();

    // coloca el valor 1 a las celdas seleccionadas por el usuario
    // ya que luego dichas celdas serán pintadas de morado
    processSpecificIntervals(scheduleSelection, false, 1, true);
    

    let sheetNrow = sheetData.length;
    let sheetNcol = sheetData[0].length;
    var tempSheetData = [];
    var tempSheetText = [];
    var tempHourList = [];
    var tempReferenceData = [];

    
    // getting empty intervals at the end of days (so we exclude them)
    let cntEmptyInTheEnd = 0;
    for (let i = sheetNrow - 1; i >= 0 ; i--) {
        var rowSum = sheetData[i].reduce(function (acc, val) { return acc + val; }, 0);
        if (rowSum == 0) cntEmptyInTheEnd++;
        else break;
    }

    // applying continued time intervals (from the begining)
    for (i = 0; i < sheetNrow - cntEmptyInTheEnd; i++) {
        var rowSum = sheetData[i].reduce(function (acc, val) { return acc + val; }, 0);
        if (rowSum > 0 || tempSheetData.length > 0) {
            if (start_time == 0)
                start_time = TIMESHEET_INTERVAL * i;
            tempSheetData.push(sheetData[i]);
            tempSheetText.push(sheetText[i]);
            tempHourList.push(hourList[i]);
            tempReferenceData.push(reference_data[i]);
        }
    }

    reference_data = tempReferenceData; // used to parse bookings

    sheetData = tempSheetData; // used to set initial table states
    sheetText = tempSheetText;
    hourList = tempHourList;

    if(sheetData.length === 0){
      jQuery("#availability").html('😔 No se encontró un horario disponible ');
      return null;
    }

    dimensions[0] = sheetData.length;
    dimensions[1] = sheetData[0].length;

    
    // it was tested that next line successfully paints the tableblock with the selected color (purple at the moment)
    // sheetData[0][0] = 1;

    return {
        reference_data,
        sheetData,
        hourList,
        dayList,
        dimensions,
        reference_hour,
        sheetText,
    };
}

function getBookingIntervalsForSheetData(sheetData, reference_data, selectionToReplace) {
  const nRows = sheetData.length;
  const nCols = sheetData[0].length;

  const availableStates = [1];
  
  let intervals = [];
  for (let col = 0; col < nCols; col++) { // days
      let lastWasAvailable = false;
      let lastStart = -1;
      for (let row = 0; row < nRows; row++) {
          const thisIsAvailable = availableStates.includes(sheetData[row][col]);
          if (thisIsAvailable && !lastWasAvailable) {
              lastStart = row;
          } else if (!thisIsAvailable && lastWasAvailable) {
              const lastEnd = row;
              const interval = getSpecificInterval(lastStart, lastEnd, col, reference_data);
              intervals.push(interval);
          }

          lastWasAvailable = thisIsAvailable;
      }
      if (lastWasAvailable) { // closing the last one
          const interval = getSpecificInterval(lastStart, nRows, col, reference_data);
          intervals.push(interval);
      }
  }

  const selectionCopy = (selectionToReplace == null) ? [] : [...selectionToReplace];
  const notInThisWeek = selectionCopy.filter((v) => {
      for (let col = 0; col < nCols; col++) { // days
          const pick_date = reference_data[0][col]['booking_date'];
          if (pick_date == v.pick_date) {
              return false;
          }
      }
      return true;
  });

  const allIntervals = notInThisWeek.concat(intervals);

  allIntervals.sort((a, b) => {
      const c1 = a.pick_date.localeCompare(b.pick_date);
      if (c1 == 0) {
          return a.start_time - b.start_time;
      }
      return c1;
  });

  return allIntervals;
}


function getWeekDayFromDate(booking_date) {
  const weekDay = new Date(booking_date + "T00:00:00.000-05:00").getDay();
  return weekDay;
}

function getSpecificInterval(rowStart, rowEnd, col, reference_data) {
  const start_time = Number(reference_data[rowStart][col]['start_time']);
  const pick_date = reference_data[rowStart][col]['booking_date'];
  const weekday = getWeekDayFromDate(pick_date);
  const end_time = start_time + (rowEnd - rowStart) * TIMESHEET_INTERVAL;
  return {
      start_time,
      pick_date,
      weekday,
      end_time,

  };
}

function minutesFromDayToTimestamp(minutes, date_string) {
  // const date = new Date(date_string.replace("-", "/"));
  // in Chrome: Wed Nov 18 2020 00:00:00 GMT-0500 (hora estándar de Perú)
  // in Safari: Invalid Date

  const startOfDay = new Date(date_string + "T" + convert_minutes_to_time(minutes) + ":00.000-05:00"); // timezone set

  return startOfDay.getTime();
}

function convert_minutes_to_time(minutes) {
  var hour = Math.floor(Number(minutes) / 60);
  var minute = Number(minutes) % 60;
  return leftPad(hour, 2) + ":" + leftPad(minute, 2);
}
function leftPad(number, targetLength) {
  var output = number + '';
  while (output.length < targetLength) {
      output = '0' + output;
  }
  return output;
}

function pad(num, size) {
  var s = "000000000" + num;
  return s.substr(s.length - size);
}