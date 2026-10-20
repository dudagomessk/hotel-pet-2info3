<script setup>
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { buscarCep, cadastrarTutor } from '@/services/api';
import {
  ESTADOS,
  cpfCnpjValido,
  emailValido,
  mascaraCep,
  mascaraCpfCnpj,
  mascaraEmail,
  mascaraTelefone,
  somenteDigitos,
  telefoneValido,
} from '@/utils/masks';

const router = useRouter();

const MSG_OBRIGATORIO = 'Ops, campo obrigatório, por favor preencha-o!';

const form = reactive({
  nome: '',
  cpfCnpj: '',
  telefone: '',
  email: '',
  dataNascimento: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});

// só mostra o erro depois que o usuário mexeu no campo
const tocado = reactive({});
const salvando = ref(false);
const erroApi = ref('');
const cepStatus = ref('');

const erros = computed(() => ({
  nome: form.nome.trim() ? '' : MSG_OBRIGATORIO,
  telefone: !form.telefone
    ? MSG_OBRIGATORIO
    : telefoneValido(form.telefone)
      ? ''
      : 'Telefone incompleto. Informe DDD + número.',
  cpfCnpj:
    !form.cpfCnpj || cpfCnpjValido(form.cpfCnpj)
      ? ''
      : 'Informe 11 dígitos (CPF) ou 14 dígitos (CNPJ).',
  email:
    !form.email || emailValido(form.email) ? '' : 'Informe um e-mail válido.',
  cep:
    !form.cep || somenteDigitos(form.cep).length === 8
      ? ''
      : 'O CEP deve ter 8 dígitos.',
}));

// o botão só habilita com Nome e Telefone válidos
const formularioValido = computed(() =>
  Object.values(erros.value).every((msg) => !msg),
);

const mostrarErro = (campo) => tocado[campo] && erros.value[campo];

function aoDigitarTelefone(e) {
  form.telefone = mascaraTelefone(e.target.value);
  e.target.value = form.telefone;
}
function aoDigitarCpfCnpj(e) {
  form.cpfCnpj = mascaraCpfCnpj(e.target.value);
  e.target.value = form.cpfCnpj;
}
function aoDigitarEmail(e) {
  form.email = mascaraEmail(e.target.value);
  e.target.value = form.email;
}
async function aoDigitarCep(e) {
  form.cep = mascaraCep(e.target.value);
  e.target.value = form.cep;
  cepStatus.value = '';

  // com 8 dígitos, consulta o ViaCEP e preenche o endereço
  if (somenteDigitos(form.cep).length === 8) {
    cepStatus.value = 'buscando';
    try {
      const dados = await buscarCep(somenteDigitos(form.cep));
      if (!dados) {
        cepStatus.value = 'nao-encontrado';
        return;
      }
      form.rua = dados.logradouro || form.rua;
      form.bairro = dados.bairro || form.bairro;
      form.cidade = dados.localidade || form.cidade;
      form.estado = dados.uf || form.estado;
      cepStatus.value = '';
    } catch {
      cepStatus.value = 'erro';
    }
  }
}

async function salvarTutor() {
  Object.keys(erros.value).forEach((campo) => (tocado[campo] = true));
  if (!formularioValido.value || salvando.value) return;

  // obrigatórios: nome e telefone. Os demais só vão se forem preenchidos.
  const tutor = {
    nome: form.nome.trim(),
    telefone: somenteDigitos(form.telefone),
  };
  if (form.cpfCnpj) tutor.cpfCnpj = somenteDigitos(form.cpfCnpj);
  if (form.email) tutor.email = form.email;
  if (form.dataNascimento) tutor.dataNascimento = form.dataNascimento;
  for (const campo of ['rua', 'numero', 'bairro', 'cidade', 'estado']) {
    if (form[campo].trim()) tutor[campo] = form[campo].trim();
  }
  if (form.cep) tutor.cep = somenteDigitos(form.cep);

  salvando.value = true;
  erroApi.value = '';
  try {
    // o id é gerado automaticamente pelo JSON Server
    await cadastrarTutor(tutor);
    router.push('/tutores');
  } catch {
    erroApi.value =
      'Não foi possível cadastrar o tutor. Verifique se o JSON Server está rodando.';
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <div>
    <header class="mb-4">
      <h1 class="h2 fw-bold">Cadastrar Tutor</h1>
      <p class="text-body-secondary mb-0">
        Preencha os dados para cadastrar um novo tutor.
      </p>
    </header>

    <form
      novalidate
      @submit.prevent="salvarTutor"
    >
      <h2 class="h5 fw-semibold border-bottom pb-2 mb-3">Dados do Tutor</h2>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <label
            for="id"
            class="form-label fw-semibold"
            >ID</label
          >
          <input
            id="id"
            type="text"
            class="form-control"
            placeholder="Gerado automaticamente"
            disabled
          />
        </div>

        <div class="col-md-8">
          <label
            for="nome"
            class="form-label fw-semibold"
            >Nome Completo</label
          >
          <input
            id="nome"
            v-model="form.nome"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': mostrarErro('nome') }"
            placeholder="Digite o nome completo"
            @blur="tocado.nome = true"
            @input="tocado.nome = true"
          />
          <div class="invalid-feedback">{{ erros.nome }}</div>
        </div>

        <div class="col-md-6">
          <label
            for="cpfCnpj"
            class="form-label fw-semibold"
            >CPF / CNPJ</label
          >
          <input
            id="cpfCnpj"
            :value="form.cpfCnpj"
            type="text"
            inputmode="numeric"
            class="form-control"
            :class="{ 'is-invalid': mostrarErro('cpfCnpj') }"
            placeholder="Digite o CPF ou CNPJ"
            @blur="tocado.cpfCnpj = true"
            @input="
              aoDigitarCpfCnpj($event);
              tocado.cpfCnpj = true;
            "
          />
          <div class="invalid-feedback">{{ erros.cpfCnpj }}</div>
          <div
            v-if="!mostrarErro('cpfCnpj')"
            class="form-text"
          >
            A máscara muda conforme 11 dígitos (CPF) ou 14 dígitos (CNPJ).
          </div>
        </div>

        <div class="col-md-6">
          <label
            for="telefone"
            class="form-label fw-semibold"
            >Telefone / Celular / WhatsApp</label
          >
          <input
            id="telefone"
            :value="form.telefone"
            type="tel"
            inputmode="numeric"
            class="form-control"
            :class="{ 'is-invalid': mostrarErro('telefone') }"
            placeholder="(00) 00000-0000"
            @blur="tocado.telefone = true"
            @input="
              aoDigitarTelefone($event);
              tocado.telefone = true;
            "
          />
          <div class="invalid-feedback">{{ erros.telefone }}</div>
          <div
            v-if="mostrarErro('telefone')"
            class="form-text"
          >
            Formato: (00) 00000-0000
          </div>
        </div>

        <div class="col-md-6">
          <label
            for="email"
            class="form-label fw-semibold"
            >E-mail</label
          >
          <input
            id="email"
            :value="form.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': mostrarErro('email') }"
            placeholder="nome@example.com"
            @blur="tocado.email = true"
            @input="
              aoDigitarEmail($event);
              tocado.email = true;
            "
          />
          <div class="invalid-feedback">{{ erros.email }}</div>
        </div>

        <div class="col-md-6">
          <label
            for="dataNascimento"
            class="form-label fw-semibold"
            >Data de Nascimento</label
          >
          <input
            id="dataNascimento"
            v-model="form.dataNascimento"
            type="date"
            class="form-control"
          />
        </div>
      </div>

      <h2 class="h5 fw-semibold border-bottom pb-2 mb-3">Endereço</h2>

      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <label
            for="cep"
            class="form-label fw-semibold"
            >CEP</label
          >
          <input
            id="cep"
            :value="form.cep"
            type="text"
            inputmode="numeric"
            class="form-control"
            :class="{ 'is-invalid': mostrarErro('cep') }"
            placeholder="00000-000"
            @blur="tocado.cep = true"
            @input="
              aoDigitarCep($event);
              tocado.cep = true;
            "
          />
          <div class="invalid-feedback">{{ erros.cep }}</div>
          <div
            v-if="cepStatus === 'buscando'"
            class="form-text"
          >
            Buscando endereço no ViaCEP...
          </div>
          <div
            v-else-if="cepStatus === 'nao-encontrado'"
            class="form-text"
          >
            CEP não encontrado. Preencha o endereço manualmente.
          </div>
          <div
            v-else-if="cepStatus === 'erro'"
            class="form-text"
          >
            Não foi possível consultar o ViaCEP. Preencha manualmente.
          </div>
        </div>

        <div class="col-md-6">
          <label
            for="rua"
            class="form-label fw-semibold"
            >Rua</label
          >
          <input
            id="rua"
            v-model="form.rua"
            type="text"
            class="form-control"
            placeholder="Digite o nome da rua"
          />
        </div>

        <div class="col-md-2">
          <label
            for="numero"
            class="form-label fw-semibold"
            >Número</label
          >
          <input
            id="numero"
            v-model="form.numero"
            type="text"
            class="form-control"
            placeholder="Número"
          />
        </div>

        <div class="col-md-4">
          <label
            for="bairro"
            class="form-label fw-semibold"
            >Bairro</label
          >
          <input
            id="bairro"
            v-model="form.bairro"
            type="text"
            class="form-control"
            placeholder="Digite o bairro"
          />
        </div>

        <div class="col-md-5">
          <label
            for="cidade"
            class="form-label fw-semibold"
            >Cidade</label
          >
          <input
            id="cidade"
            v-model="form.cidade"
            type="text"
            class="form-control"
            placeholder="Digite a cidade"
          />
        </div>

        <div class="col-md-3">
          <label
            for="estado"
            class="form-label fw-semibold"
            >Estado</label
          >
          <select
            id="estado"
            v-model="form.estado"
            class="form-select"
          >
            <option value="">Selecione</option>
            <option
              v-for="uf in ESTADOS"
              :key="uf"
              :value="uf"
            >
              {{ uf }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="erroApi"
        class="alert alert-danger"
        role="alert"
      >
        {{ erroApi }}
      </div>

      <div
        v-if="!formularioValido"
        class="alert alert-info py-2"
        role="status"
      >
        <i class="bi bi-info-circle me-2"></i>
        Preencha corretamente Nome e Telefone para habilitar o cadastro.
      </div>

      <div class="d-flex justify-content-end gap-2">
        <RouterLink
          class="btn btn-outline-secondary"
          to="/tutores"
        >
          Cancelar
        </RouterLink>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!formularioValido || salvando"
        >
          Cadastrar Tutor
        </button>
      </div>
    </form>
  </div>
</template>
