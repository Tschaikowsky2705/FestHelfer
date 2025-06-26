<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>FestHelfer</title>
  <style>
    /* Base Styles */
    body {
      font-family: sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      color: #333;
      line-height: 1.5;
    }
    h1 {
      margin: .5em 0;
      text-align: center;
      font-size: 1.8em;
    }
    label {
      font-weight: bold;
      margin-bottom: .3em;
      display: block;
    }
    select, input, button {
      font-size: 1em;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    /* Container */
    .container {
      max-width: 480px;
      margin: 0 auto;
      padding: 1em;
    }

    /* Event Dropdown */
    #event-select {
      width: 100%;
      padding: .8em;
      margin-bottom: 1em;
    }

    /* Shift Card */
    .shift-card {
      background: #fff;
      border-radius: 6px;
      margin-bottom: 1em;
      padding: 1em;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .shift-card h3 {
      margin: 0 0 .5em;
      font-size: 1.3em;
    }
    .shift-card p {
      margin: .4em 0;
      font-size: .95em;
    }
    .shift-card .spots {
      margin-top: .6em;
      font-style: italic;
      color: #555;
    }
    .shift-card button.btn-signup {
      width: 100%;
      padding: .8em;
      background: #0070f3;
      color: #fff;
      border: none;
      border-radius: 4px;
      margin-top: .8em;
    }
    .shift-card button.btn-signup:disabled {
      background: #999;
    }

    /* Inline Registration Form */
    .signup-form {
      display: none;
      margin-top: 1em;
      padding-top: 1em;
      border-top: 1px solid #eee;
    }
    .signup-form input {
      width: 100%;
      padding: .6em;
      margin: .4em 0;
    }
    .signup-form button {
      width: 100%;
      padding: .8em;
      background: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      margin-top: .6em;
    }
    .signup-form .msg {
      margin-top: .6em;
      font-size: .9em;
    }

    /* Media Queries */
    @media (min-width: 481px) {
      .container {
        max-width: 600px;
      }
      .shift-card {
        display: flex;
        flex-direction: column;
      }
      .shift-card h3 {
        font-size: 1.5em;
      }
      .shift-card button.btn-signup {
        max-width: 200px;
        margin-left: auto;
      }
      .signup-form button {
        max-width: 200px;
        margin-left: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>FestHelfer</h1>

    <!-- Event-Auswahl -->
    <label for="event-select">Veranstaltung wählen:</label>
    <select id="event-select">
      <option value="">– bitte wählen –</option>
    </select>

    <!-- Container für die Shift-Cards -->
    <div id="shifts-container"></div>
  </div>

  <!-- Hauptskript -->
  <script type="module" src="./main.js"></script>
</body>
</html>
