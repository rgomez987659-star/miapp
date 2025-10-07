async function enviarMensaje(mensaje) {
  const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: mensaje }]
    })
  });

  const datos = await respuesta.json();
  document.getElementById("respuestaAsistente").innerText = datos.choices[0].message.content;
}
