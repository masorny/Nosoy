function timeParse(time){
    const d = new Date().getTime() - new Date(time).getTime()
    const tu = {sec: Math.floor(d / 1000), min: Math.floor(d / (1000 * 60)), hou: Math.floor(d / ((1000 * 60) * 60)), day: Math.floor(d / (((1000 * 60) * 60) *24)), mon: Math.floor(d / ((((1000 * 60) * 60) *24) * 31)), yea: Math.floor(d / (((((1000 * 60) * 60) *24) * 31) * 12)), dec: Math.floor(d / ((((((1000 * 60) * 60) *24) * 31) * 12) * 10))}
    const txt = {sec: {sing: "segundo", plur: "segundos"}, min: {sing: "minuto", plur: "minutos"}, hou: {sing: "hora", plur: "horas"}, day: {sing: "día", plur: "días"}, mon: {sing: "mes", plur: "meses"}, yea: {sing: "año", plur: "años"}, dec: {sing: "decada", plur: "decadas"}}
    return "hace " + (tu.sec>59?tu.min>59?tu.hou>24?tu.day>31?tu.mon>12?tu.yea>10?tu.dec:tu.yea:tu.mon:tu.day:tu.hou:tu.min:(tu.sec<3?'un momento':tu.sec)) + (tu.sec>=3?' ':'') + (tu.sec>59?tu.min>59?tu.hou>24?tu.day>31?tu.mon>12?tu.yea>10?(tu.dec>1?txt.dec.plur:txt.dec.sing):(tu.yea>1?txt.yea.plur:txt.yea.sing):(tu.mon>1?txt.mon.plur:txt.mon.sing):(tu.day>1?txt.day.plur:txt.day.sing):(tu.hou>1?txt.hou.plur:txt.hou.sing):(tu.min>1?txt.min.plur:txt.min.sing):(tu.sec<3?'':txt.sec.plur))
}

module.exports = timeParse

