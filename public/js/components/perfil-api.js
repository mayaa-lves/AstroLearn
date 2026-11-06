import {
  sessaoObrigatoria,
  api
} from "../services/conexao.js";

import { dashboard } from "../services/aluno.js";
import { iniciarGaleria } from "./galeria-avatar.js";

const session = sessaoObrigatoria("aluno");
const $ = id => document.getElementById(id);
const user = session.usuario;

$("studentName").textContent = user.nome || "Aluno";

$("studentEmail").textContent =
  user.email || "E-mail não informado na sessão";

$("avatarInitials").textContent = (user.nome || "Aluno")
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(part => part[0])
  .join("")
  .toLocaleUpperCase("pt-BR");

iniciarGaleria(user);

async function loadSchool() {
  $("retrySchool").disabled = true;
  $("retrySchool").hidden = true;
  $("schoolError").textContent = "";

  $("roomName").textContent = "Carregando…";
  $("teamName").textContent = "Carregando…";

  try {
    const data = await dashboard();

    $("roomName").textContent =
      data.sala?.nome || "Sem turma";

    $("teamName").textContent =
      data.equipe?.nome || "Não vinculada";
  } catch (error) {
    $("roomName").textContent = "Não disponível";
    $("teamName").textContent = "Não disponível";

    $("schoolError").textContent =
      error.message ||
      "Não foi possível consultar sua turma.";

    $("retrySchool").hidden = false;
  } finally {
    $("retrySchool").disabled = false;
  }
}

$("retrySchool").addEventListener("click", loadSchool);

loadSchool();