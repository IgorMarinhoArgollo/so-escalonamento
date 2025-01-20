import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function FichaDoProcesso({ setProcessos, processos, index, setMostrarGrafico }) { 
  const [formData, setFormData] = useState({
    nomeDoProcesso: String.fromCharCode(65 + index),
    tempoDeChegada: '',
    tempoDeExecucao: '',
    deadLine: '',
    paginas: Math.floor(Math.random() * 10) + 1,
  });

  useEffect(() => {
    if (processos[index]) {
      const processo = processos[index];
      const letraDefault = String.fromCharCode(65 + index);

      setFormData({
        nomeDoProcesso: processo.nomeDoProcesso || letraDefault,
        tempoDeChegada: processo.tempoDeChegada?.toString() || '',
        tempoDeExecucao: processo.tempoDeExecucao?.toString() || '',
        deadLine: processo.deadLine?.toString() || '',
        paginas: processo.paginas || processo.paginas?.toString(),
      });
    }
  }, [processos, index]);

  const handleChange = (e) => {
    setMostrarGrafico(false); 
    const { name, value } = e.target;
    const novoFormData = { ...formData, [name]: value };
    setFormData(novoFormData);

    const novoProcesso = {
      nomeDoProcesso: novoFormData.nomeDoProcesso || String.fromCharCode(65 + index),
      tempoDeChegada: parseInt(novoFormData.tempoDeChegada, 10) || 0,
      tempoDeExecucao: parseInt(novoFormData.tempoDeExecucao, 10) || 0,
      deadLine: parseInt(novoFormData.deadLine, 10) || 0,
      paginas: parseInt(novoFormData.paginas, 10) || Math.floor(Math.random() * 10) + 1,
      clocks: [],
    };

    setProcessos((processosAnteriores) => {
      const processosAtualizados = [...processosAnteriores];
      processosAtualizados[index] = {
        ...processosAtualizados[index],
        ...novoProcesso
      };
      return processosAtualizados;
    });
  };

  return (
    <div className='proccessDiv'>
      <form>
        {/* Nome do Processo */}
        <div className='inputDiv'>
          <label htmlFor={`nomeDoProcesso-${index}`}>
            Nome do Processo
          </label>
          <input
            type="text"
            id={`nomeDoProcesso-${index}`}
            name="nomeDoProcesso"
            value={formData.nomeDoProcesso}
            onChange={handleChange}
            required
          />
        </div>
        {/* Tempo de chegada */}
        <div className='inputDiv'>
          <label htmlFor={`tempoDeChegada-${index}`}>
            Tempo de Chegada
          </label>
          <input
            type="number"
            id={`tempoDeChegada-${index}`}
            name="tempoDeChegada"
            value={formData.tempoDeChegada}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        {/* Tempo de execução */}
        <div className='inputDiv'>
          <label htmlFor={`tempoDeExecucao-${index}`}>
            Tempo de Execução
          </label>
          <input
            type="number"
            id={`tempoDeExecucao-${index}`}
            name="tempoDeExecucao"
            value={formData.tempoDeExecucao}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        {/* DeadLine */}
        <div className='inputDiv'>
          <label htmlFor={`deadLine-${index}`}>
            Deadline
          </label>
          <input
            type="number"
            id={`deadLine-${index}`}
            name="deadLine"
            value={formData.deadLine}
            onChange={handleChange}
            min="0"
            required
          />
        </div>

        {/* Paginas */}
        <div className='inputDiv'>
          <label htmlFor={`paginas-${index}`}>
            # de Páginas
          </label>
          <input
            type="number"
            id={`paginas-${index}`}
            name="paginas"
            value={formData.paginas}
            onChange={handleChange}
            min="0"
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
  setMostrarGrafico: PropTypes.func.isRequired,
};

export default FichaDoProcesso;