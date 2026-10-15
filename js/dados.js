/* Dados dos simuladores. Medias de mercado: o veiculo e o prazo de cada viagem sao confirmados na cotacao. */
window.DADOS = {
  /* Carga util e volume maximos (medias de mercado; pesos conforme Res. CONTRAN 882/2021).
     comp: comprimento aproximado em metros, para o desenho em escala. */
  veiculos: [
    { id: 'vuc', nome: 'VUC', uso: 'Entrega urbana com restrição de circulação', t: 3, m3: 20, comp: 6.3, eixos: 2, tipo: 'rigido' },
    { id: '34', nome: '3/4', uso: 'Distribuição urbana e regional', t: 4.5, m3: 28, comp: 7.5, eixos: 2, tipo: 'rigido' },
    { id: 'toco', nome: 'Toco', uso: 'Distribuição regional e carga fracionada', t: 8, m3: 45, comp: 9.5, eixos: 2, tipo: 'rigido' },
    { id: 'truck', nome: 'Truck', uso: 'Média distância, carga seca', t: 14, m3: 55, comp: 11.5, eixos: 3, tipo: 'rigido' },
    { id: 'bitruck', nome: 'Bitruck', uso: 'Mais volume sem articulação', t: 19, m3: 65, comp: 14, eixos: 4, tipo: 'rigido' },
    { id: 'carreta', nome: 'Carreta', uso: 'Longa distância: sider, baú ou carga seca', t: 33, m3: 110, comp: 18.6, eixos: 5, tipo: 'carreta' },
    { id: 'bitrem', nome: 'Bitrem', uso: 'Granéis e alto volume, 7 eixos', t: 40, m3: null, comp: 19.8, eixos: 7, tipo: 'bitrem' },
    { id: 'rodotrem', nome: 'Rodotrem', uso: 'Corredores de granel, com autorização especial', t: 52, m3: null, comp: 30, eixos: 9, tipo: 'rodotrem' }
  ],
  /* Destino por UF: cidade de referencia, coordenadas e distancia rodoviaria aproximada a partir de Barueri, SP. */
  destinos: {
    AC: ['Acre', 'Rio Branco', -67.81, -9.97, 3550],
    AL: ['Alagoas', 'Maceió', -35.73, -9.66, 2450],
    AP: ['Amapá', 'Macapá', -51.07, 0.03, 3950, 'balsa'],
    AM: ['Amazonas', 'Manaus', -60.02, -3.12, 3950, 'balsa'],
    BA: ['Bahia', 'Salvador', -38.5, -12.97, 1980],
    CE: ['Ceará', 'Fortaleza', -38.54, -3.72, 3100],
    DF: ['Distrito Federal', 'Brasília', -47.88, -15.79, 1010],
    ES: ['Espírito Santo', 'Vitória', -40.31, -20.32, 900],
    GO: ['Goiás', 'Goiânia', -49.25, -16.68, 920],
    MA: ['Maranhão', 'São Luís', -44.3, -2.53, 2970],
    MT: ['Mato Grosso', 'Cuiabá', -56.1, -15.6, 1600],
    MS: ['Mato Grosso do Sul', 'Campo Grande', -54.62, -20.47, 990],
    MG: ['Minas Gerais', 'Belo Horizonte', -43.94, -19.92, 600],
    PA: ['Pará', 'Belém', -48.5, -1.46, 2930],
    PB: ['Paraíba', 'João Pessoa', -34.86, -7.12, 2770],
    PR: ['Paraná', 'Curitiba', -49.27, -25.43, 410],
    PE: ['Pernambuco', 'Recife', -34.88, -8.05, 2660],
    PI: ['Piauí', 'Teresina', -42.8, -5.09, 2790],
    RJ: ['Rio de Janeiro', 'Rio de Janeiro', -43.17, -22.91, 440],
    RN: ['Rio Grande do Norte', 'Natal', -35.21, -5.79, 2950],
    RS: ['Rio Grande do Sul', 'Porto Alegre', -51.23, -30.03, 1110],
    RO: ['Rondônia', 'Porto Velho', -63.9, -8.76, 3060],
    RR: ['Roraima', 'Boa Vista', -60.67, 2.82, 4750, 'balsa'],
    SC: ['Santa Catarina', 'Florianópolis', -48.55, -27.59, 700],
    SP: ['São Paulo', 'São José do Rio Preto', -49.38, -20.82, 430],
    SE: ['Sergipe', 'Aracaju', -37.07, -10.91, 2180],
    TO: ['Tocantins', 'Palmas', -48.33, -10.18, 1770]
  },
  /* Torre de controle: o que cada nivel acrescenta a viagem de exemplo (Barueri a Curitiba, 410 km). */
  niveis: {
    essencial: 'Seguros obrigatórios averbados, veículo rastreado, aviso de ocorrências e comprovante de entrega digital.',
    monitorada: 'Tudo do Essencial, mais consulta de motorista, plano de viagem, central 24 horas e cercas eletrônicas.',
    protegida: 'Para carga de alto valor: isca de carga, escolta velada ou armada conforme o PGR e pronta resposta.',
    dedicada: 'Um ponto focal para a sua conta, relatórios de OTIF, lead time e ocorrências, e reunião de resultados.'
  },
  ordemNiveis: ['essencial', 'monitorada', 'protegida', 'dedicada'],
  marcos: [
    { hora: 'Seg 07:10', titulo: 'Coleta confirmada', texto: 'Truck com placa e motorista informados.', nivel: 'essencial', pos: 0 },
    { hora: 'Seg 07:25', titulo: 'Motorista consultado', texto: 'Cadastro aprovado pela gerenciadora de risco.', nivel: 'monitorada', pos: 0 },
    { hora: 'Seg 08:40', titulo: 'Carregamento conferido', texto: 'Fotos da carga amarrada e nota fiscal conferida.', nivel: 'essencial', pos: 0 },
    { hora: 'Seg 09:05', titulo: 'Seguros averbados', texto: 'RCTR C, RC DC e RC V antes da saída.', nivel: 'essencial', pos: 0.04 },
    { hora: 'Seg 09:15', titulo: 'Isca e escolta ativas', texto: 'Escolta velada acompanha o trecho da Régis Bittencourt.', nivel: 'protegida', pos: 0.08 },
    { hora: 'Seg 11:30', titulo: 'Na rota planejada', texto: 'Cerca eletrônica ativa; desvio gera alerta na central.', nivel: 'monitorada', pos: 0.45 },
    { hora: 'Seg 14:50', titulo: 'Chegou ao destino', texto: 'Na doca dentro da janela de descarga.', nivel: 'essencial', pos: 1 },
    { hora: 'Seg 16:20', titulo: 'Comprovante de entrega', texto: 'Canhoto assinado, em PDF, no mesmo dia.', nivel: 'essencial', pos: 1 },
    { hora: 'Sex 10:00', titulo: 'Relatório da semana', texto: 'OTIF, lead time e ocorrências da conta na semana.', nivel: 'dedicada', pos: 1 }
  ]
};
