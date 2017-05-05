package translation;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.junit.Test;


/**
 * Unit test for simple App.
 */
public class TranslationTest 
{
	/**
	 * Testes el funcionamiento del traductor de ADN a aminoacidos
	 */
	@Test
	public void predFuncTest() 
	{
		Path filePath = Paths.get("src/test/testfile/test.txt");
		Scanner scanner;
		try {
			scanner = new Scanner(filePath);
			Translator translator = new Translator();
			List<String> startCodons = new ArrayList<String>();
			startCodons.add("ATG");
			List<List<String>> result = translator.translation(scanner.next(), startCodons );
			for(List<String> r : result){
				for(String s : r){
					if(scanner.hasNext()){
						assertEquals(s, scanner.next());
						
					}else{
						fail();
					}
					
				}
			}
			
			
			
			    

		} catch (IOException e) {
			fail(e.getLocalizedMessage());
		}
	}
}
