import PropTypes from 'prop-types';

const GraficoGantt = ({ processos }) => {
  // ... código existente ...
  return (
    <div className="grafico-gantt">
      <div className='grafico'>
        <h2 className='ganttTittle'>Gráfico de Execução</h2>
        <div className="linha-processo">
          <div className="clocks-container">
            {processos[0]?.clocks.concat(['']).map((_, index) => (
              <div key={index} className="index-position">
                {index}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Processos existentes */}
      {processos.map((processo, index) => (
        <div key={index} className="linha-processo">
          <div className="nome-processo">{processo.nomeDoProcesso}</div>
          <div className="clocks-container">
            {processo.clocks.map((estado, clockIndex) => (
              <div
                key={clockIndex}
                className={`clock-box ${estado}`}
                title={`P${index + 1} - Clock ${clockIndex}: ${estado}`}
              />
            ))}
          </div>
        </div>
      ))}

    <div className='legendas'>
      <div className='itemLegenda'>
        <div className='clock-box espera'></div>
        <p className='itemText'>Processo em espera</p>
      </div>

      <div className='itemLegenda'>
        <div className='clock-box executando'></div>
        <p className='itemText'>Processo em Execução</p>
      </div>

      <div className='itemLegenda'>
        <div className='clock-box sobrecarga'></div>
        <p className='itemText'>Processo em Sobrecarga</p>
      </div>

      <div className='itemLegenda'>
        <div className='clock-box espera-dead'></div>
        <p className='itemText'>Processo em espera morto</p>
      </div>

      <div className='itemLegenda'>
        <div className='clock-box executando-dead'></div>
        <p className='itemText'>Processo em execução morto</p>
      </div>
    </div>
    </div>
  );
};

GraficoGantt.propTypes = {
  processos: PropTypes.arrayOf(PropTypes.shape({
    clocks: PropTypes.array.isRequired
  })).isRequired
};

export default GraficoGantt