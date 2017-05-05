package translation;

import java.util.ArrayList;
import java.util.List;

/**
 * Implementa la traducción de adn a proteinas
 */
public class Translator
{
	CodonTable table;
	
    public Translator() {
		super();
		table=new CodonTable();
	}
    /**
     * Realiza todas las traducciones posibles de la cadena de ADN en dirección 5' 3'
     * @param dna Cadena de ADN
     * @param startCodons Codones de inicio
     * @return
     */
	public List<List<String>> translation( String dna , List<String> startCodons)
    {
    	ArrayList<List<String>> arr = new ArrayList<List<String>>();
    	arr.add(translate(dna, startCodons));
    	arr.add(translate(dna.substring(1), startCodons));
    	arr.add(translate(dna.substring(2), startCodons));
		return arr;
    	
    }
	/**
	 * Realiza una traducción de la cadena de ADN
	 * @param dna Cadena de ADN
	 * @param startCodons Codones de inicio
	 * @return
	 */
    private List<String> translate(String dna, List<String> startCodons){
    	List<String> proteins= new ArrayList<String>();
    	String aminoacyds = "";
    	boolean started = false;
    	for( String s : dna.split("(?<=\\G...)")){
    		if(started){
    			String a=table.getAminoAcidSequence(s);
    			if(a == null){
    				started = false;
        			proteins.add(aminoacyds);
        			aminoacyds = "";
    			}
    			else{
    				aminoacyds += a;
    			}
    			
    		}
    		else if(startCodons.contains(s)){
    			//Comienza
    			started=true;
    			//El primer aminoacido siempre es metionina src : http://depts.washington.edu/agro/genomes/students/stanstart.htm
    			aminoacyds += "M";
    		}
    	}
    	if(aminoacyds != ""){
    		proteins.add(aminoacyds);
    	}
    	return proteins;
    }
}
