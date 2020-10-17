const { App, LogLevel } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG
});

var x=0;
var y=0;
var aux = 2;
var value = '';
var fechaunico = '';
app.message("Agregar recordatorio", async ({ payload, context }) => {
  try {
    const result = await app.client.chat.postMessage({
      as_user: true,
      token: process.env.SLACK_BOT_TOKEN,
      channel: 'G01CHM7CLTA',
      blocks: [
          {
          type: "section",
          block_id: "section678",
          text: {
            type: "mrkdwn",
            text: "Que clase de recordatorio desea crear"
          },
          accessory: {
            action_id: "TipoDeRecordatorio",
            type: "static_select",
            placeholder: {
              type: "plain_text",
              text: "Elija una opcion"
            },
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Periodico diario"
                },
                value: "Diario"
              },
              {
                text: {
                  type: "plain_text",
                  text: "Periodico semanal"
                },
                value: "Semanal"
              },
              {
                text: {
                  type: "plain_text",
                  text: "Solo una vez"
                },
                value: "Unico"
              }
            ]
          }
        }
      ]
    });

    //console.log(result);
    x = result.ts;
  }
  catch (error) {
    console.error(error);
  }
});

app.action(('TipoDeRecordatorio'), async ({ payload, ack, say }) => {
  await ack();
  value = payload.selected_option.value;
  const result = await app.client.chat.update({
    as_user: true,
    token: process.env.SLACK_BOT_TOKEN,
    channel: 'G01CHM7CLTA',
    ts: x,
    text: 'Que clase de recordatorio desea crear',
    blocks: []
  });
  //console.log(result)
  if (value == "Unico") {
    try {
      const result2 = await app.client.chat.postMessage({
        as_user: true,
        token: process.env.SLACK_BOT_TOKEN,
        channel: "G01CHM7CLTA",
        blocks: [
          {
            type: "section",
            block_id: "section1234",
            text: {
              type: "mrkdwn",
              text: "Escoja una fecha para su recordatorio."
            },
            accessory: {
              type: "datepicker",
              action_id: "FechaUnico",
              placeholder: {
                type: "plain_text",
                text: "Escoger fecha"
              }
            }
          }
        ]
      });
      //console.log(result);
      y = result2.ts;
    } catch (error) {
      console.error(error);
    }
  }
});

if (value=='Diario')
{
    
}

if (value=='Semanal')
{
    
}

app.action(('FechaUnico'), async ({ payload, ack, say }) => {
  aux = 0;
  await ack();
  fechaunico = payload.selected_date;
  const result = await app.client.chat.update({
    as_user: true,
    token: process.env.SLACK_BOT_TOKEN,
    ts: y,
    channel: 'G01CHM7CLTA',
    text: 'Escoja una fecha para su recordatorio.',
    blocks: []
  });
  await say('Escriba la hora para el recordatorio en formato: hora:minuto');
    app.message(":", async ({ message, say }) => {
      aux = 1;
      var mensaje;
      var today = new Date();
      var fecha = fechaunico.split("-");
      var hora = message.text.split(":");
      console.log("Hora:" + hora);
      var year = parseInt(fecha[0], 10);
      var month = parseInt(fecha[1], 10) - 1;
      var day = parseInt(fecha[2], 10);
      var hour = parseInt(hora[0], 10) + 4;
      if (hour >= 24) {
        day += 1;
        hour -= 24;
      }
      var minute = parseInt(hora[1], 10);
      console.log(
        "Fecha:" +
          year +
          "," +
          month +
          "," +
          day +
          " Hora:" +
          hour +
          "," +
          minute
      );
      var deadline = new Date(year, month, day, hour, minute, 0, 0);
      var deadlineUNIX = deadline.getTime() / 1000;
      var todayUNIX = today.getTime() / 1000;
      console.log("deadline:" + deadline);
      console.log("Today:"+today)
      if (deadlineUNIX < todayUNIX) {
        await say("Esa fecha ya pasó");
      }
      if (deadlineUNIX > todayUNIX) {
        await say("Que mensaje desea agregar a su recordatorio??");
          app.message("", async ({ message, say }) => {
            mensaje = message.text;
            await say("Recordatorio guardado");
            try {
              // Call chat.scheduleMessage with the built-in client
              await app.client.chat.scheduleMessage({
                ok: true,
                token: process.env.SLACK_BOT_TOKEN,
                channel: "G01CHM7CLTA",
                text: mensaje,
                post_at: deadlineUNIX
              });
            } catch (error) {
              console.error(error);
            }
          });
      }
    });
  //console.log(result)
});

async function listScheduledMessages(latest, oldest) {
  try {
    const result = await app.client.chat.scheduledMessages.list({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "G01CHM7CLTA",
      latest: latest,
      oldest: oldest
    });

    for (const message of result.scheduled_messages) {
      console.log(message);
    }
  } catch (error) {
    console.error(error);
  }
}
app.message("lista de recordatorios", async ({ message, say }) => {
  listScheduledMessages(3002486101606, 1551991427);
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
