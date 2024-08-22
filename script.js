function generateGanttChart() {
    // Clear any previous errors
    document.getElementById("errorMessages").innerHTML = "";
    
    // Retrieve input values
    var processes = parseInt(document.getElementById("processes").value);
    var arrivalTimes = document.getElementById("arrivalTimes").value.trim();
    var burstTimes = document.getElementById("burstTimes").value.trim();
    var algorithm = document.getElementById("algorithm").value;

    // Validate input values
    if (isNaN(processes) || processes <= 0) {
        displayError("Number of processes must be a positive integer.");
        return;
    }

    var arrivalArray = arrivalTimes.split(",");
    var burstArray = burstTimes.split(",");

    if (arrivalArray.length !== processes || burstArray.length !== processes) {
        displayError("Number of arrival times and burst times must match the number of processes.");
        return;
    }

    for (var i = 0; i < processes; i++) {
        if (isNaN(parseInt(arrivalArray[i])) || isNaN(parseInt(burstArray[i])) || parseInt(arrivalArray[i]) < 0 || parseInt(burstArray[i]) <= 0) {
            displayError("Arrival times and burst times must be non-negative integers.");
            return;
        }
    }

    // Perform scheduling based on selected algorithm
    var completionTimes = [];
    var turnaroundTimes = [];
    var waitingTimes = [];

    if (algorithm === "FCFS") {
        performFCFS(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes);
    }
    else if (algorithm === "SJF") {
        performSJF(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes);
    }
    else if (algorithm === "RR") {
        performRoundRobin(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes);
    }
    else {
        // Implement other scheduling algorithms here
        // For example, implement Round Robin (RR), Shortest Job First (SJF), etc.
        displayError("Selected algorithm is not supported.");
        return;
    }

    // Generate Gantt Chart and display results
    displayResults(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes);
}

function performFCFS(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes) {
    var currentTime = 0;

    for (var i = 0; i < processes; i++) {
        if (currentTime < parseInt(arrivalArray[i])) {
            currentTime = parseInt(arrivalArray[i]);
        }

        completionTimes[i] = currentTime + parseInt(burstArray[i]);
        turnaroundTimes[i] = completionTimes[i] - parseInt(arrivalArray[i]);
        waitingTimes[i] = turnaroundTimes[i] - parseInt(burstArray[i]);

        currentTime = completionTimes[i];
    }
}

function performSJF(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes) {
    var completed = 0;
    var currentTime = 0;
    var isCompleted = new Array(processes).fill(false);

    while (completed !== processes) {
        var shortest = -1;
        var minBurstTime = Number.MAX_SAFE_INTEGER;

        for (var i = 0; i < processes; i++) {
            if (arrivalArray[i] <= currentTime && !isCompleted[i]) {
                if (burstArray[i] < minBurstTime) {
                    minBurstTime = burstArray[i];
                    shortest = i;
                } else if (burstArray[i] === minBurstTime) {
                    // Resolve tie by selecting the process with the earliest arrival time
                    if (arrivalArray[i] < arrivalArray[shortest]) {
                        shortest = i;
                    }
                }
            }
        }

        if (shortest !== -1) {
            currentTime += parseInt(burstArray[shortest]);
            completionTimes[shortest] = currentTime;
            turnaroundTimes[shortest] = completionTimes[shortest] - parseInt(arrivalArray[shortest]);
            waitingTimes[shortest] = turnaroundTimes[shortest] - parseInt(burstArray[shortest]);

            isCompleted[shortest] = true;
            completed++;
        } else {
            currentTime++;
        }
    }
}

function performRoundRobin(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes, timeQuantum = 2) {
    var remainingBurstTimes = [...burstArray];
    var currentTime = 0;
    var completed = 0;
    var queue = [];
    var isInQueue = new Array(processes).fill(false);

    while (completed !== processes) {
        // Add processes to the queue based on arrival time
        for (var i = 0; i < processes; i++) {
            if (arrivalArray[i] <= currentTime && !isInQueue[i] && remainingBurstTimes[i] > 0) {
                queue.push(i);
                isInQueue[i] = true;
            }
        }

        if (queue.length === 0) {
            currentTime++;
            continue;
        }

        var index = queue.shift();
        isInQueue[index] = false;

        var execTime = Math.min(timeQuantum, remainingBurstTimes[index]);
        currentTime += execTime;
        remainingBurstTimes[index] -= execTime;

        // Check if the process is completed
        if (remainingBurstTimes[index] === 0) {
            completed++;
            completionTimes[index] = currentTime;
            turnaroundTimes[index] = completionTimes[index] - arrivalArray[index];
            waitingTimes[index] = turnaroundTimes[index] - burstArray[index];
        } else {
            // Add the process back to the queue if it's not completed
            queue.push(index);
        }

        // Add any new processes to the queue that have arrived
        for (var i = 0; i < processes; i++) {
            if (arrivalArray[i] <= currentTime && !isInQueue[i] && remainingBurstTimes[i] > 0) {
                queue.push(i);
                isInQueue[i] = true;
            }
        }
    }
}






function displayResults(processes, arrivalArray, burstArray, completionTimes, turnaroundTimes, waitingTimes) {
    var ganttChart = document.getElementById("ganttChart");
    ganttChart.innerHTML = "";

    var table = document.createElement("table");
    var headerRow = table.insertRow(0);
    headerRow.innerHTML = "<th>Process</th><th>Arrival Time</th><th>Burst Time</th><th>Completion Time</th><th>Turnaround Time</th><th>Waiting Time</th>";

    for (var i = 0; i < processes; i++) {
        var row = table.insertRow(i + 1);
        row.innerHTML = "<td>" + (i + 1) + "</td><td>" + arrivalArray[i] + "</td><td>" + burstArray[i] + "</td><td>" + completionTimes[i] + "</td><td>" + turnaroundTimes[i] + "</td><td>" + waitingTimes[i] + "</td>";
    }

    ganttChart.appendChild(table);
}

function displayError(errorMessage) {
    var errorContainer = document.getElementById("errorMessages");
    var errorElement = document.createElement("p");
    errorElement.classList.add("error");
    errorElement.innerHTML = errorMessage;
    errorContainer.appendChild(errorElement);
}
