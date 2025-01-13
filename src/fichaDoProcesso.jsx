import { useState } from 'react';
import PropTypes from 'prop-types';

function FichaDoProcesso({ setProcessos, /* processos, */ index }) {
  const [formData, setFormData] = useState({
    nomeDoProcesso: '',
    tempoDeChegada: '',
    tempoDeExecucao: '',
    deadLine: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const novoFormData = { ...formData, [name]: value };
    setFormData(novoFormData);

    const novoProcesso = {
      nomeDoProcesso: novoFormData.nomeDoProcesso,
      tempoDeChegada: parseInt(novoFormData.tempoDeChegada, 10) || 0,
      tempoDeExecucao: parseInt(novoFormData.tempoDeExecucao, 10) || 0,
      deadLine: parseInt(novoFormData.deadLine, 10) || 0,
      clocs: [],
    };

    setProcessos((processosAnteriores) => {
      const processosAtualizados = [...processosAnteriores];
      processosAtualizados[index] = novoProcesso;
      return processosAtualizados;
    });
  };

  return (
    <div className='proccessDiv'>
      <form>
        {/* Nome do Processo */}
        <div className='inputDiv'>
          <label htmlFor="nomeDoProcesso">
            Nome do Processo
          </label>
          <input
            type="text"
            id="nomeDoProcesso"
            name="nomeDoProcesso"
            value={formData.nomeDoProcesso}
            onChange={handleChange}
            required
          />
        </div>
        {/* Tempo de chegada */}
        <div className='inputDiv'>
          <label htmlFor="tempoDeChegada">
            Tempo de Chegada
          </label>
          <input
            type="number"
            id="tempoDeChegada"
            name="tempoDeChegada"
            value={formData.tempoDeChegada}
            onChange={handleChange}
            required
          />
        </div>
        {/* Tempo de execução */}
        <div className='inputDiv'>
          <label htmlFor="tempoDeExecucao">
            Tempo de Execução
          </label>
          <input
            type="number"
            id="tempoDeExecucao"
            name="tempoDeExecucao"
            value={formData.tempoDeExecucao}
            onChange={handleChange}
            required
          />
        </div>
        {/* DeadLine */}
        <div className='inputDiv'>
          <label htmlFor="deadLine">
            Deadline
          </label>
          <input
            type="number"
            id="deadLine"
            name="deadLine"
            value={formData.deadLine}
            onChange={handleChange}
            required
          />
        </div>
      </form>
    </div>
  );
}

FichaDoProcesso.propTypes = {
  setProcessos: PropTypes.func.isRequired,
  processos: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
};

export default FichaDoProcesso;