export const API_URL = 'http://localhost:3000';

async function requisicao(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });

  if (!resposta.ok) {
    const erro = new Error(`Erro ${resposta.status} em ${caminho}`);
    erro.status = resposta.status;
    throw erro;
  }

  const texto = await resposta.text();
  return texto ? JSON.parse(texto) : null;
}

// Tutores
export const listarTutores = () => requisicao('/tutores');
export const buscarTutor = (id) => requisicao(`/tutores/${id}`);
export const cadastrarTutor = (tutor) =>
  requisicao('/tutores', { method: 'POST', body: JSON.stringify(tutor) });
export const removerTutor = (id) =>
  requisicao(`/tutores/${id}`, { method: 'DELETE' });

// Pets
export const listarPets = () => requisicao('/pets');
export const listarPetsDoTutor = (tutorId) =>
  requisicao(`/pets?tutorId=${tutorId}`);
export const cadastrarPet = (pet) =>
  requisicao('/pets', { method: 'POST', body: JSON.stringify(pet) });

// ViaCEP (link que o professor passou)
export async function buscarCep(cep) {
  const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!resposta.ok) throw new Error('Falha ao consultar o ViaCEP');
  const dados = await resposta.json();
  if (dados.erro) return null;
  return dados;
}
