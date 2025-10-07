async function enviarMensaje(mensaje) {
  const respuesta = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer TU_API_KEY_AQUI"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: mensaje }]
    })
  });

  const datos = await respuesta.json();
  document.getElementById("respuestaAsistente").innerText = datos.choices[0].message.content;
}
